import type { Express, Request, Response } from 'express';
import { randomUUID, randomBytes } from 'node:crypto';
import { db, transaction } from './db.js';

// These routes are mounted AFTER the signed HTTP-only admin session middleware.
// There are no public reads/writes, client Firebase credentials or browser-side admin secrets.
let initializing: Promise<void> | null = null;
async function ensureOps() {
  if (!initializing) initializing = (async () => {
    await db.query("CREATE TABLE IF NOT EXISTS membership_applications (id uuid PRIMARY KEY, full_name varchar(120) NOT NULL, contact_method varchar(12) NOT NULL, contact_value varchar(160) NOT NULL, rules_accepted_at timestamptz NOT NULL, is_adult boolean NOT NULL, status varchar(24) NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz, review_note varchar(600))");
    await db.query("CREATE TABLE IF NOT EXISTS membership_members (id uuid PRIMARY KEY, application_id uuid UNIQUE REFERENCES membership_applications(id), member_number varchar(32) NOT NULL UNIQUE, full_name varchar(120) NOT NULL, contact_method varchar(12) NOT NULL, contact_value varchar(160) NOT NULL, status varchar(24) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')), approved_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS membership_attendance (id uuid PRIMARY KEY, member_id uuid NOT NULL REFERENCES membership_members(id), kind varchar(12) NOT NULL CHECK (kind IN ('member','guest')), guest_name varchar(120), checked_in timestamptz NOT NULL DEFAULT now(), checked_out timestamptz, created_at timestamptz NOT NULL DEFAULT now(), CHECK ((kind='member' AND guest_name IS NULL) OR (kind='guest' AND guest_name IS NOT NULL)))");
    await db.query("CREATE TABLE IF NOT EXISTS membership_incident_logs (id uuid PRIMARY KEY, category varchar(60) NOT NULL, description varchar(3000) NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now(), recorded_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS membership_audit_events (id uuid PRIMARY KEY, action varchar(60) NOT NULL, subject_id varchar(64), details varchar(500) NOT NULL DEFAULT '', occurred_at timestamptz NOT NULL DEFAULT now())");
    for (const table of ['membership_applications','membership_members','membership_attendance','membership_incident_logs','membership_audit_events']) {
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
const MAX_CUSTOMERS=80; // Operational ceiling from existing venue setup; verify against current licence.
const MAX_GUESTS_PER_MEMBER=2; // Conservative current policy; verify against current licence.
async function audit(client: {query:typeof db.query}, action:string, id:string, details='') {
  await client.query('INSERT INTO membership_audit_events(id,action,subject_id,details) VALUES ($1,$2,$3,$4)',[randomUUID(),action,id,details]);
}
export function installMemberOperations(app:Express) {
  app.get('/api/membership/overview',async (_req,res)=>{
    try{
      await ensureOps();
      const [apps,members,visits,incidents]=await Promise.all([
        db.query("SELECT status,count(*)::int AS count FROM membership_applications GROUP BY status"),
        db.query("SELECT status,count(*)::int AS count FROM membership_members GROUP BY status"),
        db.query("SELECT kind,count(*)::int AS count FROM membership_attendance WHERE checked_out IS NULL GROUP BY kind"),
        db.query("SELECT count(*)::int AS count FROM membership_incident_logs WHERE occurred_at::date = (now() AT TIME ZONE 'Europe/London')::date")
      ]);
      const byStatus=(rows:Array<{status:string,count:number}>,name:string)=>rows.find(x=>x.status===name)?.count||0;
      const byKind=(k:string)=>visits.rows.find(x=>x.kind===k)?.count||0;
      return res.json({success:true,
        pending:byStatus(apps.rows,'pending'),reviewed:byStatus(apps.rows,'reviewed'),
        activeMembers:byStatus(members.rows,'active'),suspendedMembers:byStatus(members.rows,'suspended'),
        membersInside:byKind('member'),guestsInside:byKind('guest'),
        occupancy:byKind('member')+byKind('guest'),workingCapacity:MAX_CUSTOMERS,
        incidentsToday:incidents.rows[0]?.count||0,notices:['Counts cover membership check-ins only; reconcile with restaurant customers and staff.','Working capacity and guest limits require verification against the current licence.']});
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
    if(!idValid(applicationId)||req.body?.confirmAge!==true||req.body?.confirmEligibility!==true||req.body?.confirmLicence!==true)
      return res.status(400).json({success:false,error:'Confirm age/identity, eligibility and the applicable licence conditions before approval.'});
    try{
      await ensureOps();
      const member=await transaction(async client=>{
        await client.query('SELECT pg_advisory_xact_lock(230042)');
        const a=(await client.query("SELECT * FROM membership_applications WHERE id=$1 FOR UPDATE",[applicationId])).rows[0];
        if(!a)return {error:'Application not found.',status:404};
        if(a.status==='declined')return {error:'Declined application cannot be activated.',status:409};
        if(!a.is_adult||!a.rules_accepted_at)return {error:'Required application declarations are missing.',status:409};
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
      if('error' in member)return res.status(member.status).json({success:false,error:member.error});
      return res.status(201).json({success:true,...member,notice:'Membership active. Digital QR passes are not enabled until server verification and credential delivery are complete.'});
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
        await audit(client,'MEMBER_STATUS_CHANGED',id,old.status+' → '+status);
        return {member:updated};
      });
      if(!out)return res.status(404).json({success:false,error:'Member not found.'});
      if('error' in out)return res.status(409).json({success:false,error:out.error});
      return res.json({success:true,...out});
    }catch(e){return respondErr(res,e);}
  });
  app.get('/api/membership/attendance',async(_req,res)=>{
    try{
      await ensureOps();
      const rows=await db.query(
        "SELECT v.id,v.member_id,v.kind,v.guest_name,v.checked_in,v.checked_out,m.member_number,m.full_name AS member_name "+
        "FROM membership_attendance v JOIN membership_members m ON m.id=v.member_id "+
        "ORDER BY v.checked_in DESC LIMIT 250"
      );
      return res.json({success:true,attendance:rows.rows});
    }catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/attendance/check-in',async(req,res)=>{
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
        const occupancy=Number((await client.query("SELECT count(*)::int AS n FROM membership_attendance WHERE checked_out IS NULL")).rows[0].n);
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
      if('error' in out)return res.status(out.status).json({success:false,error:out.error});
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
  app.get('/api/membership/incidents',async(_req,res)=>{
    try{await ensureOps();const rows=await db.query('SELECT id,category,description,occurred_at,recorded_at FROM membership_incident_logs ORDER BY recorded_at DESC LIMIT 150');
      return res.json({success:true,incidents:rows.rows});}catch(e){return respondErr(res,e);}
  });
  app.post('/api/membership/incidents',async(req,res)=>{
    const category=clean(req.body?.category,60),description=clean(req.body?.description,3000);
    if(!['Entry refusal','Conduct','Safeguarding','Medical','Other'].includes(category)||description.length<10)
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
