import type { Express, Response } from 'express';
import type { PoolClient } from 'pg';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { membershipDb as db, membershipTransaction as transaction, requireMembershipDatabase } from './membershipDb.js';

// These routes are mounted AFTER the signed HTTP-only admin session middleware.
// There are no public reads/writes, client Firebase credentials or browser-side admin secrets.
let initializing: Promise<void> | null = null;
async function ensureOps() {
  requireMembershipDatabase();
  if (!initializing) initializing = (async () => {
    await db.query("CREATE TABLE IF NOT EXISTS membership_applications (id uuid PRIMARY KEY, full_name varchar(120) NOT NULL, contact_method varchar(12) NOT NULL, contact_value varchar(160) NOT NULL, rules_accepted_at timestamptz NOT NULL, is_adult boolean NOT NULL, status varchar(24) NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz, review_note varchar(600))");
    await db.query("CREATE TABLE IF NOT EXISTS membership_members (id uuid PRIMARY KEY, application_id uuid UNIQUE REFERENCES membership_applications(id), member_number varchar(32) NOT NULL UNIQUE, full_name varchar(120) NOT NULL, contact_method varchar(12) NOT NULL, contact_value varchar(160) NOT NULL, status varchar(24) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')), approved_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS membership_attendance (id uuid PRIMARY KEY, member_id uuid NOT NULL REFERENCES membership_members(id), kind varchar(12) NOT NULL CHECK (kind IN ('member','guest')), guest_name varchar(120), checked_in timestamptz NOT NULL DEFAULT now(), checked_out timestamptz, created_at timestamptz NOT NULL DEFAULT now(), CHECK ((kind='member' AND guest_name IS NULL) OR (kind='guest' AND guest_name IS NOT NULL)))");
    await db.query("CREATE TABLE IF NOT EXISTS membership_incident_logs (id uuid PRIMARY KEY, category varchar(60) NOT NULL, description varchar(3000) NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now(), recorded_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS membership_audit_events (id uuid PRIMARY KEY, action varchar(60) NOT NULL, subject_id varchar(64), details varchar(500) NOT NULL DEFAULT '', occurred_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS membership_pass_credentials (id uuid PRIMARY KEY, member_id uuid NOT NULL UNIQUE REFERENCES membership_members(id), token_hash varchar(64) NOT NULL UNIQUE, issued_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, revoked_at timestamptz, last_verified_at timestamptz)");
    await db.query('ALTER TABLE public.membership_applications ADD COLUMN IF NOT EXISTS hospitality_role varchar(160)');
    await db.query('ALTER TABLE public.membership_attendance ADD COLUMN IF NOT EXISTS smoking_started_at timestamptz');
    await db.query("CREATE TABLE IF NOT EXISTS membership_capacity_log (id uuid PRIMARY KEY, hour_start timestamptz NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now(), customers_inside integer NOT NULL CHECK(customers_inside BETWEEN 0 AND 80), member_count integer NOT NULL, guest_count integer NOT NULL, notes varchar(500) NOT NULL DEFAULT '', UNIQUE(hour_start))");
    for (const table of ['membership_applications','membership_members','membership_attendance','membership_incident_logs','membership_audit_events','membership_pass_credentials','membership_capacity_log']) {
      await db.query('ALTER TABLE public.' + table + ' ENABLE ROW LEVEL SECURITY');
      await db.query('REVOKE ALL ON TABLE public.' + table + ' FROM anon, authenticated');
    }
    await db.query("CREATE INDEX IF NOT EXISTS membership_attendance_active_idx ON membership_attendance (checked_out, member_id)");
    await db.query("CREATE UNIQUE INDEX IF NOT EXISTS membership_unique_active_member_visit ON membership_attendance(member_id) WHERE kind='member' AND checked_out IS NULL");
  })().catch(err => { initializing=null; throw err; });
  await initializing;
}
function respondErr(res: Response, error: unknown) {
  console.error('Member operations error:',error instanceof Error?error.message:'Unknown');
  return res.status(503).json({success:false,error:'Membership service temporarily unavailable.'});
}
function idValid(id: string) { return /^[a-f0-9]{8}-[a-f0-9-]{27,}$/i.test(id); }
function clean(v: unknown, max:number) {return typeof v==='string'?v.trim().slice(0,max):'';}
// 256-bit opaque bearer pass. The QR embeds only a hash-fragment URL; the database stores only the SHA-256 hash.
const hashPass=(token:string)=>createHash('sha256').update(token,'utf8').digest('hex');
function normalizePassToken(value:unknown):string|null{
 if(typeof value!=='string'||value.length>1500)return null;
 let candidate=value.trim();
 if(candidate.startsWith('https://')){
  try{
   const url=new URL(candidate);
   if(!['members.amicasoho.com','www.amicasoho.com'].includes(url.host))return null;
   candidate=new URLSearchParams(url.hash.replace(/^#/,'')).get('t')||'';
  }catch{return null}
 }
 return /^[a-zA-Z0-9_-]{43}$/.test(candidate)?candidate:null;
}

const MAX_CUSTOMERS=80; // Premises licence 19/00938/LIPDPS condition 14, excluding staff.
const MAX_GUESTS_PER_MEMBER=2; // Condition 37(b), applied conservatively at all times.
// Hard stop for NEW admission after 01:30 local time. Smoking return uses a separate logged transition.
function lateAdmissionClosed():boolean{
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 const h=Number(parts.find(p=>p.type==='hour')?.value||0),m=Number(parts.find(p=>p.type==='minute')?.value||0);
 return (h===1&&m>=30)||(h>=2&&h<6);
}
async function audit(client: PoolClient, action:string, id:string, details='') {
  await client.query('INSERT INTO membership_audit_events(id,action,subject_id,details) VALUES ($1,$2,$3,$4)',[randomUUID(),action,id,details]);
}
export function installMemberOperations(app:Express) {
  app.get('/api/membership/overview',async (_req,res)=>{
    try{
      await ensureOps();
      const [apps,members,visits,incidents]=await Promise.all([
        db.query("SELECT status,count(*)::int AS count FROM membership_applications GROUP BY status"),
        db.query("SELECT status,count(*)::int AS count FROM membership_members GROUP BY status"),
        db.query("SELECT kind,count(*)::int AS count FROM membership_attendance WHERE checked_out IS NULL AND smoking_started_at IS NULL GROUP BY kind"),
        db.query("SELECT count(*)::int AS count FROM membership_incident_logs WHERE occurred_at::date = (now() AT TIME ZONE 'Europe/London')::date")
      ]);
      const byStatus=(rows:Array<{status:string,count:number}>,name:string)=>rows.find(x=>x.status===name)?.count||0;
      const byKind=(k:string)=>visits.rows.find(x=>x.kind===k)?.count||0;
      return res.json({success:true,
        pending:byStatus(apps.rows,'pending'),reviewed:byStatus(apps.rows,'reviewed'),
        activeMembers:byStatus(members.rows,'active'),suspendedMembers:byStatus(members.rows,'suspended'),
        membersInside:byKind('member'),guestsInside:byKind('guest'),
        occupancy:byKind('member')+byKind('guest'),workingCapacity:MAX_CUSTOMERS,
        incidentsToday:incidents.rows[0]?.count||0,notices:['Counts cover membership check-ins only; reconcile with restaurant customers and exclude staff.','Conditions 14, 22, 31 and 37 require full hourly headcount, smoking exit limits and late-night admission controls.']});
    } catch(e){return respondErr(res,e);}
  });
  app.get('/api/membership/members',async (req,res)=>{
    try{
      await ensureOps();
      const search=clean(req.query.search,90);
      const rows=await db.query(
        "SELECT id,application_id,member_number,full_name,contact_method,contact_value,status,approved_at,created_at FROM membership_members "+
        (search?"WHERE full_name ILIKE $1 OR member_number ILIKE $1 OR contact_value ILIKE $1 ":"")+"ORDER BY approved_at DESC LIMIT 250",
        search?['%'+search+'%']:[]
      );
      return res.json({success:true,members:rows.rows});
    }catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/members/approve',async(req,res)=>{
    const applicationId=clean(req.body?.applicationId,64);
    if(!idValid(applicationId)||req.body?.confirmAge!==true||req.body?.confirmEligibility!==true||req.body?.confirmHospitality!==true||req.body?.confirmLicence!==true)
      return res.status(400).json({success:false,error:'Confirm age/identity, eligibility and the applicable licence conditions before approval.'});
    try{
      await ensureOps();
      const member=await transaction(async client=>{
        await client.query('SELECT pg_advisory_xact_lock(230042)');
        const a=(await client.query("SELECT * FROM membership_applications WHERE id=$1 FOR UPDATE",[applicationId])).rows[0];
        if(!a)return {error:'Application not found.',status:404};
        if(a.status==='declined')return {error:'Declined application cannot be activated.',status:409};
        if(!a.is_adult||!a.rules_accepted_at)return {error:'Required application declarations are missing.',status:409};
        if(!a.hospitality_role||String(a.hospitality_role).trim().length<3)return {error:'Applicant hospitality occupation or employer must be recorded and verified before approval.',status:409};
        const ageHours=(Date.now()-new Date(a.created_at).getTime())/3600000;
        if(ageHours<48)return {error:'The current membership policy requires at least 48 hours after application before activation.',status:409};
        const prior=await client.query('SELECT id FROM membership_members WHERE application_id=$1',[applicationId]);
        if(prior.rowCount)return {error:'Application already has a member record.',status:409};
        const memberId=randomUUID();
        const number='AMC-'+randomBytes(5).toString('hex').toUpperCase();
        const created=(await client.query(
          "INSERT INTO membership_members(id,application_id,member_number,full_name,contact_method,contact_value,status,approved_at) VALUES($1,$2,$3,$4,$5,$6,'active',now()) RETURNING id,member_number,full_name,status,approved_at",
          [memberId,applicationId,number,a.full_name,a.contact_method,a.contact_value]
        )).rows[0];
        await client.query("UPDATE membership_applications SET status='approved',reviewed_at=now(),updated_at=now() WHERE id=$1",[applicationId]);
        await audit(client,'MEMBER_APPROVED',memberId,'Declarations reviewed; membership active after 48-hour policy.');
        return {member:created};
      });
      if('error' in member && member.error)return res.status(member.status || 409).json({success:false,error:member.error});
      return res.status(201).json({success:true,...member,notice:'Membership approved. Issue the server-verified personal digital pass from the Members section.'});
    }catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/members/:id/status',async(req,res)=>{
    const id=clean(req.params.id,64),status=clean(req.body?.status,20);
    if(!idValid(id)||!['active','suspended','revoked'].includes(status))return res.status(400).json({success:false,error:'Invalid member or status.'});
    try{
      await ensureOps();
      const out=await transaction(async client=>{
        await client.query('SELECT pg_advisory_xact_lock(230042)');
        const old=(await client.query("SELECT id,status FROM membership_members WHERE id=$1 FOR UPDATE",[id])).rows[0];
        if(!old)return null;
        if(old.status==='revoked'&&status!=='revoked')return {error:'Revoked membership must be reviewed again; it cannot simply be reactivated.'};
        const updated=(await client.query("UPDATE membership_members SET status=$1,updated_at=now() WHERE id=$2 RETURNING id,status",[status,id])).rows[0];
        if(status!=='active')await client.query('UPDATE membership_attendance SET checked_out=now() WHERE member_id=$1 AND checked_out IS NULL',[id]);
        if(status!=='active')await client.query('UPDATE membership_pass_credentials SET revoked_at=coalesce(revoked_at,now()) WHERE member_id=$1',[id]);
        await audit(client,'MEMBER_STATUS_CHANGED',id,old.status+' → '+status);
        return {member:updated};
      });
      if(!out)return res.status(404).json({success:false,error:'Member not found.'});
      if('error' in out)return res.status(409).json({success:false,error:out.error});
      return res.json({success:true,...out});
    }catch(e){return respondErr(res,e);}
  });

  // Issue or rotate a member's pass credential. Never grant admission from mere possession of a pass;
  // staff must verify the credential AND identity and use the authenticated check-in control.
  app.post('/api/membership/members/:id/pass',async(req,res)=>{
    const id=clean(req.params.id,64);
    if(!idValid(id))return res.status(400).json({success:false,error:'Invalid member ID.'});
    try{
      await ensureOps();
      const issued=await transaction(async client=>{
        await client.query('SELECT pg_advisory_xact_lock(230042)');
        const member=(await client.query('SELECT id,full_name,member_number,status,contact_method,contact_value FROM membership_members WHERE id=$1 FOR UPDATE',[id])).rows[0];
        if(!member)return {error:'Member not found.',status:404};
        if(member.status!=='active')return {error:'Only active members can receive a pass.',status:409};
        const token=randomBytes(32).toString('base64url'),hash=hashPass(token);
        const row=(await client.query(
          "INSERT INTO membership_pass_credentials(id,member_id,token_hash,issued_at,expires_at,revoked_at) VALUES($1,$2,$3,now(),now()+interval '90 days',NULL) "+
          "ON CONFLICT(member_id) DO UPDATE SET token_hash=excluded.token_hash,issued_at=excluded.issued_at,expires_at=excluded.expires_at,revoked_at=NULL,last_verified_at=NULL "+
          "RETURNING expires_at",
          [randomUUID(),id,hash]
        )).rows[0];
        await audit(client,'PASS_ISSUED',id,'Prior pass credential rotated; expiry '+new Date(row.expires_at).toISOString());
        return {token,member,expiresAt:row.expires_at};
      });
      if('error'in issued&&issued.error)return res.status(issued.status||409).json({success:false,error:issued.error});
      const passUrl='https://members.amicasoho.com/pass#t='+issued.token;
      let delivery:'sent'|'manual'|'failed'='manual';
      // For email-based members, send their own credential directly. Phone-based members need a private manual share.
      if(issued.member.contact_method==='email' && process.env.RESEND_API_KEY){
        try{
          const from=process.env.FROM_EMAIL||'AMICA SOHO <noreply@amicasoho.london>';
          const sent=await fetch('https://api.resend.com/emails',{
            method:'POST',
            headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
            signal:AbortSignal.timeout(12000),
            body:JSON.stringify({from,to:[issued.member.contact_value],
              subject:'Your AMICA SOHO digital membership pass',
              text:'Your membership has been approved. Open your private digital pass:\n\n'+passUrl+
                '\n\nThis credential is personal. Please bring photo ID when visiting AMICA SOHO. '+
                'A pass does not guarantee entry. If this message is unexpected, contact info@amicasoho.com.'})
          });
          delivery=sent.ok?'sent':'failed';
          if(!sent.ok)console.error('Membership pass delivery failed with status',sent.status);
        }catch(e){delivery='failed';console.error('Membership pass delivery error',e instanceof Error?e.message:'Unknown');}
      }
      res.setHeader('Cache-Control','no-store');
      return res.json({success:true,passUrl,expiresAt:issued.expiresAt,delivery,memberNumber:issued.member.member_number,
        notice:'Treat this as a private bearer credential. Share only with the named member. Staff must separately verify ID at entry.'});
    }catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/members/:id/pass/revoke',async(req,res)=>{
    const id=clean(req.params.id,64);
    if(!idValid(id))return res.status(400).json({success:false,error:'Invalid member ID.'});
    try{
      await ensureOps();
      const out=await transaction(async client=>{
        const x=await client.query('UPDATE membership_pass_credentials SET revoked_at=coalesce(revoked_at,now()) WHERE member_id=$1 AND revoked_at IS NULL RETURNING member_id',[id]);
        if(!x.rowCount)return false;
        await audit(client,'PASS_REVOKED',id,'Pass disabled by staff');
        return true;
      });
      return out?res.json({success:true}):res.status(404).json({success:false,error:'No active pass found.'});
    }catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/passes/verify',async(req,res)=>{
    const token=normalizePassToken(req.body?.token);
    if(!token)return res.status(400).json({success:false,error:'This is not a valid AMICA pass format.'});
    try{
      await ensureOps();
      const rows=await db.query("SELECT m.id AS member_id,m.member_number,m.full_name,m.status,p.expires_at,p.revoked_at "+
        "FROM membership_pass_credentials p JOIN membership_members m ON m.id=p.member_id WHERE p.token_hash=$1 LIMIT 1",[hashPass(token)]);
      const row=rows.rows[0];
      if(!row||row.revoked_at||new Date(row.expires_at).getTime()<Date.now()||row.status!=='active')
        return res.status(403).json({success:false,error:'Pass invalid, expired, revoked, or membership not active.'});
      await db.query('UPDATE membership_pass_credentials SET last_verified_at=now() WHERE token_hash=$1',[hashPass(token)]);
      res.setHeader('Cache-Control','no-store');
      return res.json({success:true,valid:true,member:{id:row.member_id,memberNumber:row.member_number,
        fullName:row.full_name,status:row.status},expiresAt:row.expires_at,
        notice:'Check the physical identity of the pass holder before recording entry.'});
    }catch(e){return respondErr(res,e);}
  });
  app.get('/api/membership/attendance',async(_req,res)=>{
    try{
      await ensureOps();
      const rows=await db.query(
        "SELECT v.id,v.member_id,v.kind,v.guest_name,v.checked_in,v.checked_out,v.smoking_started_at,m.member_number,m.full_name AS member_name "+
        "FROM membership_attendance v JOIN membership_members m ON m.id=v.member_id "+
        "ORDER BY v.checked_in DESC LIMIT 2000"
      );
      return res.json({success:true,attendance:rows.rows});
    }catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/attendance/check-in',async(req,res)=>{
    if(lateAdmissionClosed())return res.status(409).json({success:false,error:'No new entry or re-entry after 01:30. Only logged temporary smoking returns can re-enter.'});
    const memberId=clean(req.body?.memberId,64),kind=clean(req.body?.kind,15);
    const guestName=clean(req.body?.guestName,120);
    if(!idValid(memberId)||!['member','guest'].includes(kind)||(kind==='guest'&&guestName.length<2))
      return res.status(400).json({success:false,error:'Choose an active member and provide a guest name where applicable.'});
    try{
      await ensureOps();
      const out=await transaction(async client=>{
        await client.query('SELECT pg_advisory_xact_lock(230042)');
        const m=(await client.query('SELECT id,status,member_number FROM membership_members WHERE id=$1',[memberId])).rows[0];
        if(!m||m.status!=='active')return {error:'Member is not active. Check approval and ID.',status:409};
        const occupancy=Number((await client.query("SELECT count(*)::int AS n FROM membership_attendance WHERE checked_out IS NULL AND smoking_started_at IS NULL")).rows[0].n);
        if(occupancy>=MAX_CUSTOMERS)return {error:'Working occupancy ceiling reached. Reconcile total venue count before admitting anyone.',status:409};
        const active=(await client.query("SELECT kind,count(*)::int AS n FROM membership_attendance WHERE member_id=$1 AND checked_out IS NULL GROUP BY kind",[memberId])).rows;
        const hasMember=active.some(x=>x.kind==='member'&&x.n>0);
        if(kind==='member'&&hasMember)return {error:'Member is already checked in.',status:409};
        if(kind==='guest'&&!hasMember)return {error:'Check in the host member first.',status:409};
        if(kind==='guest'&&active.find(x=>x.kind==='guest')?.n>=MAX_GUESTS_PER_MEMBER)return {error:'Working guest limit reached for this member.',status:409};
        const duplicate=kind==='guest'?await client.query("SELECT id FROM membership_attendance WHERE member_id=$1 AND kind='guest' AND lower(guest_name)=lower($2) AND checked_out IS NULL",[memberId,guestName]):null;
        if(duplicate?.rowCount)return {error:'This guest is already checked in.',status:409};
        const visit=(await client.query(
          "INSERT INTO membership_attendance(id,member_id,kind,guest_name) VALUES($1,$2,$3,$4) RETURNING id,member_id,kind,guest_name,checked_in",
          [randomUUID(),memberId,kind,kind==='guest'?guestName:null]
        )).rows[0];
        await audit(client,kind==='guest'?'GUEST_CHECK_IN':'MEMBER_CHECK_IN',visit.id,m.member_number);
        return {visit};
      });
      if('error' in out && out.error)return res.status(out.status || 409).json({success:false,error:out.error});
      return res.status(201).json({success:true,...out});
    }catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/attendance/:id/check-out',async(req,res)=>{
    const id=clean(req.params.id,64);
    if(!idValid(id))return res.status(400).json({success:false,error:'Invalid visit.'});
    try{
      await ensureOps();
      const out=await transaction(async client=>{
        await client.query('SELECT pg_advisory_xact_lock(230042)');
        const v=(await client.query('SELECT id,member_id,kind FROM membership_attendance WHERE id=$1 AND checked_out IS NULL FOR UPDATE',[id])).rows[0];
        if(!v)return null;
        const ended=(await client.query(
          v.kind==='member'?
          'UPDATE membership_attendance SET checked_out=now() WHERE member_id=$1 AND checked_out IS NULL RETURNING id':
          'UPDATE membership_attendance SET checked_out=now() WHERE id=$1 AND checked_out IS NULL RETURNING id',
          [v.kind==='member'?v.member_id:id]
        )).rows.length;
        await audit(client,'CHECK_OUT',id,'Exited '+ended+' member/guest record(s)');
        return {count:ended};
      });
      return out?res.json({success:true,...out}):res.status(404).json({success:false,error:'Active visit not found.'});
    }catch(e){return respondErr(res,e);}
  });

  // Logged smoking re-entry is the only exception to the 01:30 admission cut-off.
  app.post('/api/membership/attendance/:id/smoking',async(req,res)=>{
    const id=clean(req.params.id,64),action=clean(req.body?.action,12);
    if(!idValid(id)||!['leave','return'].includes(action))return res.status(400).json({success:false,error:'Invalid smoking transition.'});
    try{
      await ensureOps();
      const out=await transaction(async client=>{
        await client.query('SELECT pg_advisory_xact_lock(230042)');
        const v=(await client.query('SELECT id,smoking_started_at FROM membership_attendance WHERE id=$1 AND checked_out IS NULL FOR UPDATE',[id])).rows[0];
        if(!v)return {error:'Active attendance record not found.'};
        if(action==='leave'){
          if(v.smoking_started_at)return {error:'Person is already outside smoking.'};
          const n=Number((await client.query("SELECT count(*)::int AS n FROM membership_attendance WHERE checked_out IS NULL AND smoking_started_at IS NOT NULL")).rows[0].n);
          if(n>=10)return {error:'Maximum 10 people temporarily outside smoking.'};
          await client.query('UPDATE membership_attendance SET smoking_started_at=now() WHERE id=$1',[id]);
          await audit(client,'SMOKING_EXIT',id,'Temporary smoking break started');
        }else{
          if(!v.smoking_started_at)return {error:'No recorded temporary smoking exit for this person.'};
          const n=Number((await client.query("SELECT count(*)::int AS n FROM membership_attendance WHERE checked_out IS NULL AND smoking_started_at IS NULL")).rows[0].n);
          if(n>=MAX_CUSTOMERS)return {error:'Capacity limit reached. Smoking re-entry cannot be recorded.'};
          await client.query('UPDATE membership_attendance SET smoking_started_at=NULL WHERE id=$1',[id]);
          await audit(client,'SMOKING_RETURN',id,'Returned from a logged temporary smoking exit');
        }
        return {ok:true};
      });
      if('error'in out)return res.status(409).json({success:false,error:out.error});
      return res.json({success:true,message:action==='leave'?'Smoking exit recorded.':'Smoking re-entry recorded.'});
    }catch(e){return respondErr(res,e);}
  });
  app.get('/api/membership/capacity',async(_req,res)=>{
    try{await ensureOps();const rows=await db.query('SELECT hour_start,recorded_at,customers_inside,member_count,guest_count,notes FROM membership_capacity_log ORDER BY hour_start DESC LIMIT 120');
      return res.json({success:true,capacity:rows.rows});}catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/capacity',async(req,res)=>{
    const total=Number(req.body?.customersInside),notes=clean(req.body?.notes,500);
    if(!Number.isInteger(total)||total<0||total>80)return res.status(400).json({success:false,error:'Provide a verified headcount between 0 and the licensed maximum of 80 customers.'});
    try{
      await ensureOps();
      const snapshot=await transaction(async client=>{
        const rows=(await client.query("SELECT kind,count(*)::int AS n FROM membership_attendance WHERE checked_out IS NULL AND smoking_started_at IS NULL GROUP BY kind")).rows;
        const members=rows.find(x=>x.kind==='member')?.n||0,guests=rows.find(x=>x.kind==='guest')?.n||0;
        if(total<members+guests)return {error:'Headcount cannot be less than recorded members and guests inside.'};
        const x=(await client.query("INSERT INTO membership_capacity_log(id,hour_start,customers_inside,member_count,guest_count,notes) VALUES($1,date_trunc('hour',now()),$2,$3,$4,$5) "+
          "ON CONFLICT(hour_start) DO UPDATE SET customers_inside=excluded.customers_inside,member_count=excluded.member_count,guest_count=excluded.guest_count,notes=excluded.notes,recorded_at=now() "+
          "RETURNING hour_start,customers_inside,member_count,guest_count,recorded_at",[randomUUID(),total,members,guests,notes])).rows[0];
        await audit(client,'HOURLY_CAPACITY_RECORDED','', 'Customer headcount '+total+'/80, members '+members+', guests '+guests);
        return {snapshot:x};
      });
      if('error'in snapshot)return res.status(409).json({success:false,error:snapshot.error});
      return res.json({success:true,...snapshot});
    }catch(e){return respondErr(res,e);}
  });
  app.get('/api/membership/attendance/export-31-days',async(_req,res)=>{
    try{
      await ensureOps();
      const rows=(await db.query("SELECT m.member_number,m.full_name AS member_name,v.kind,v.guest_name,v.checked_in,v.checked_out,v.smoking_started_at "+
        "FROM membership_attendance v JOIN membership_members m ON m.id=v.member_id "+
        "WHERE v.checked_in >= now()-interval '31 days' ORDER BY v.checked_in DESC")).rows;
      const quote=(value:unknown)=>{let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
      const csv=[['Member number','Member name','Type','Guest name','Check in UTC','Check out UTC','Smoking exit UTC'].join(','),
        ...rows.map(x=>[x.member_number,x.member_name,x.kind,x.guest_name,x.checked_in?new Date(x.checked_in).toISOString():'',x.checked_out?new Date(x.checked_out).toISOString():'',x.smoking_started_at?new Date(x.smoking_started_at).toISOString():''].map(quote).join(','))].join('\n');
      res.setHeader('Content-Type','text/csv; charset=utf-8');
      res.setHeader('Content-Disposition','attachment; filename="amica-membership-attendance-31days.csv"');
      return res.send(csv);
    }catch(e){return respondErr(res,e);}
  });
  app.get('/api/membership/incidents',async(_req,res)=>{
    try{await ensureOps();const rows=await db.query('SELECT id,category,description,occurred_at,recorded_at FROM membership_incident_logs ORDER BY recorded_at DESC LIMIT 150');
      return res.json({success:true,incidents:rows.rows});}catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/incidents',async(req,res)=>{
    const category=clean(req.body?.category,60),description=clean(req.body?.description,3000);
    if(!['Crime reported','Ejection','Crime or disorder complaint','Disorder','Drug or weapon seizure','CCTV/search/scanner fault','Alcohol sale refusal','Authority/emergency visit','Other'].includes(category)||description.length<10)
      return res.status(400).json({success:false,error:'Select a category and provide details (at least 10 characters).'});
    try{await ensureOps();const row=await transaction(async client=>{
      const rec=(await client.query('INSERT INTO membership_incident_logs(id,category,description) VALUES($1,$2,$3) RETURNING id,category,occurred_at',[randomUUID(),category,description])).rows[0];
      await audit(client,'INCIDENT_RECORDED',rec.id,category);return rec;
    });return res.status(201).json({success:true,incident:row});}catch(e){return respondErr(res,e);}
  });
  app.get('/api/membership/activity',async(_req,res)=>{
    try{await ensureOps();const rows=await db.query('SELECT id,action,subject_id,details,occurred_at FROM membership_audit_events ORDER BY occurred_at DESC LIMIT 100');return res.json({success:true,activity:rows.rows});}catch(e){return respondErr(res,e);}
  });
}
