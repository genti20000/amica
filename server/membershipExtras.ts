import { randomUUID } from 'node:crypto';
import type { Express, Response } from 'express';
import { membershipDb as db, membershipTransaction as transaction, requireMembershipDatabase } from './membershipDb.js';

const clean=(x:unknown,n:number)=>typeof x==='string'?x.trim().slice(0,n):'';
const valid=(x:string)=>/^[a-f0-9-]{36}$/i.test(x);
function londonHour(){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 return Number(parts.find(x=>x.type==='hour')?.value||0)*60+Number(parts.find(x=>x.type==='minute')?.value||0);
}
function admissionClosed(){const min=londonHour();return min>=90&&min<360;}
function fail(res:Response,error:unknown){
 console.error('Membership additional operations error:',error instanceof Error?error.message:'unknown');
 return res.status(503).json({success:false,error:'The membership database is not available.'});
}
export function installMemberExtraOperations(app:Express){
 // Proprietor guests: licence condition 37(b)(ii), max five bona fide proprietor guests after 1am.
 app.get('/api/membership/proprietor-guests',async(_req,res)=>{
  try{
   requireMembershipDatabase();
   const x=await db.query('SELECT id,full_name,reason,authorised_by,checked_in,checked_out,smoking_started_at FROM membership_proprietor_guests ORDER BY checked_in DESC LIMIT 200');
   return res.json({success:true,guests:x.rows});
  }catch(e){return fail(res,e)}
 });
 app.post('/api/membership/proprietor-guests',async(req,res)=>{
  const fullName=clean(req.body?.fullName,120),reason=clean(req.body?.reason,500),authorisedBy=clean(req.body?.authorisedBy,120);
  if(fullName.length<2||reason.length<3||authorisedBy.length<3||req.body?.identityChecked!==true)
   return res.status(400).json({success:false,error:'Named proprietor guest, reason, manager authorisation and identity check required.'});
  if(admissionClosed())return res.status(409).json({success:false,error:'No new admissions after 01:30.'});
  try{
   requireMembershipDatabase();
   const result=await transaction(async c=>{
    await c.query('SELECT pg_advisory_xact_lock(230042)');
    const count=(await c.query('SELECT count(*)::int AS n FROM membership_proprietor_guests WHERE checked_out IS NULL')).rows[0].n;
    if(count>=5)return {error:'Maximum five active proprietor guests already recorded.'};
    const duplicates=await c.query('SELECT id FROM membership_proprietor_guests WHERE checked_out IS NULL AND lower(full_name)=lower($1)',[fullName]);
    if(duplicates.rowCount)return {error:'This proprietor guest is already registered as inside.'};
    const inside=(await c.query("SELECT count(*)::int AS n FROM membership_attendance WHERE checked_out IS NULL AND smoking_started_at IS NULL")).rows[0].n;
    const pInside=(await c.query('SELECT count(*)::int AS n FROM membership_proprietor_guests WHERE checked_out IS NULL AND smoking_started_at IS NULL')).rows[0].n;
    if(Number(inside)+Number(pInside)>=80)return {error:'No entry: 80-person capacity reached or headcount needs reconciliation.'};
    const row=(await c.query('INSERT INTO membership_proprietor_guests(id,full_name,reason,authorised_by) VALUES($1,$2,$3,$4) RETURNING id,full_name,checked_in',[randomUUID(),fullName,reason,authorisedBy])).rows[0];
    await c.query('INSERT INTO membership_audit_events(id,action,subject_id,details) VALUES($1,$2,$3,$4)',[randomUUID(),'PROPRIETOR_GUEST_IN',row.id,'Authorised by '+authorisedBy]);
    return {guest:row};
   });
   if('error'in result)return res.status(409).json({success:false,error:result.error});
   return res.status(201).json({success:true,...result});
  }catch(e){return fail(res,e)}
 });
 app.post('/api/membership/proprietor-guests/:id/check-out',async(req,res)=>{
  const id=clean(req.params.id,64);if(!valid(id))return res.status(400).json({success:false,error:'Invalid guest ID.'});
  try{
   requireMembershipDatabase();
   const result=await transaction(async c=>{
    const row=(await c.query('UPDATE membership_proprietor_guests SET checked_out=now(),smoking_started_at=NULL WHERE id=$1 AND checked_out IS NULL RETURNING id',[id])).rows[0];
    if(row)await c.query('INSERT INTO membership_audit_events(id,action,subject_id,details) VALUES($1,$2,$3,$4)',[randomUUID(),'PROPRIETOR_GUEST_OUT',id,'Guest checked out']);
    return row;
   });
   return result?res.json({success:true}):res.status(404).json({success:false,error:'No active proprietor guest found.'});
  }catch(e){return fail(res,e)}
 });
 app.post('/api/membership/proprietor-guests/:id/smoking',async(req,res)=>{
  const id=clean(req.params.id,64),action=clean(req.body?.action,12);
  if(!valid(id)||!['leave','return'].includes(action))return res.status(400).json({success:false,error:'Invalid smoking transition.'});
  try{
   requireMembershipDatabase();
   const result=await transaction(async c=>{
    await c.query('SELECT pg_advisory_xact_lock(230042)');
    const row=(await c.query('SELECT id,smoking_started_at FROM membership_proprietor_guests WHERE id=$1 AND checked_out IS NULL FOR UPDATE',[id])).rows[0];
    if(!row)return {error:'Guest is not currently checked in.'};
    if(action==='leave'){
     if(row.smoking_started_at)return {error:'Guest already outside smoking.'};
     const a=(await c.query('SELECT count(*)::int AS n FROM membership_attendance WHERE checked_out IS NULL AND smoking_started_at IS NOT NULL')).rows[0].n;
     const b=(await c.query('SELECT count(*)::int AS n FROM membership_proprietor_guests WHERE checked_out IS NULL AND smoking_started_at IS NOT NULL')).rows[0].n;
     if(Number(a)+Number(b)>=10)return {error:'Maximum ten people outside smoking.'};
     await c.query('UPDATE membership_proprietor_guests SET smoking_started_at=now() WHERE id=$1',[id]);
    }else{
     if(!row.smoking_started_at)return {error:'Smoking exit was not recorded.'};
     await c.query('UPDATE membership_proprietor_guests SET smoking_started_at=NULL WHERE id=$1',[id]);
    }
    await c.query('INSERT INTO membership_audit_events(id,action,subject_id,details) VALUES($1,$2,$3,$4)',[randomUUID(),action==='leave'?'SMOKING_EXIT':'SMOKING_RETURN',id,'Proprietor guest']);
    return {ok:true};
   });
   if('error'in result)return res.status(409).json({success:false,error:result.error});
   return res.json({success:true});
  }catch(e){return fail(res,e)}
 });
 // Rule revisions are drafts only until external licensing-authority approval.
 app.get('/api/membership/rule-versions',async(_req,res)=>{
  try{
   requireMembershipDatabase();
   const x=await db.query('SELECT id,version,title,body,council_approved,council_reference,published_at,created_at FROM membership_rule_versions ORDER BY created_at DESC LIMIT 60');
   return res.json({success:true,rules:x.rows});
  }catch(e){return fail(res,e)}
 });
 app.post('/api/membership/rule-versions',async(req,res)=>{
  const version=clean(req.body?.version,40),title=clean(req.body?.title,160),body=clean(req.body?.body,15000);
  if(!version||title.length<3||body.length<20)return res.status(400).json({success:false,error:'Version, title and complete draft rule text are required.'});
  try{
   requireMembershipDatabase();
   const result=await transaction(async c=>{
    const row=(await c.query('INSERT INTO membership_rule_versions(id,version,title,body) VALUES($1,$2,$3,$4) RETURNING id,version,title',[randomUUID(),version,title,body])).rows[0];
    await c.query('INSERT INTO membership_audit_events(id,action,subject_id,details) VALUES($1,$2,$3,$4)',[randomUUID(),'CLUB_RULE_DRAFT',row.id,'Version '+version]);
    return row;
   });
   return res.status(201).json({success:true,rule:result,notice:'Saved as draft only. This does not constitute Westminster approval.'});
  }catch(e){return fail(res,e)}
 });
}
