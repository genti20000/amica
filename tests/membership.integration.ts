import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import express from 'express';

if (!process.env.MEMBERSHIP_FIREBASE_SERVICE_ACCOUNT) throw new Error('Set the server credential before running integration tests.');
process.env.NODE_ENV='test';
process.env.MEMBERSHIP_TEST_PREFIX='e2e_amica_'+Date.now()+'_';
process.env.VERCEL='1';
process.env.ADMIN_PASSWORD='integration-staff-'+randomUUID();
process.env.ADMIN_SESSION_SECRET=randomUUID()+randomUUID();
process.env.RESEND_API_KEY='test-mail-transport';
const request=globalThis.fetch;
let emailCode='', emailTo:any;
globalThis.fetch=(async(input:any,init:any)=>{
 if(String(input)==='https://api.resend.com/emails'){
  const mail=JSON.parse(init.body);emailTo=mail.to;
  emailCode=String(mail.text).match(/code is (\d{6})/)?.[1]||emailCode;
  return new Response('{}',{status:200});
 }
 return request(input,init);
}) as typeof fetch;
const {app}=await import('../server.ts');
const {default:apply}=await import('../api/membership.ts');
const {default:view}=await import('../api/membership-pass.ts');
const {atomic,col,list,membershipStore,read}=await import('../server/membershipFirestore.ts');
const outer=express();outer.use(express.json());outer.post('/api/membership/apply',apply);outer.post('/api/membership/pass/view',view);outer.use(app);
const server=outer.listen(0,'127.0.0.1');await once(server,'listening');
const address=server.address() as {port:number};const base='http://127.0.0.1:'+address.port;
let staff='',superCookie='';let checks=0;
async function call(path:string,body?:any,auth=true,extra:Record<string,string>={}){
 const response=await request(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(auth?{Cookie:[staff,superCookie].filter(Boolean).join('; ')}:{}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const text=await response.text();let data:any;try{data=JSON.parse(text)}catch{data=text}
 return {status:response.status,data,cookie:response.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ')};
}
function status(result:any,expected:number){assert.equal(result.status,expected,JSON.stringify(result.data));checks++;return result.data;}
async function application(hours:number,name='Integration applicant'){
 const applicationId=randomUUID(),time=new Date(Date.now()-hours*3600000).toISOString();
 await atomic(async unit=>unit.set('applications',applicationId,{id:applicationId,full_name:name,contact_method:'email',contact_value:applicationId+'@example.invalid',hospitality_role:'Test hospitality employer',rules_accepted_at:time,is_adult:true,status:'pending',created_at:time,updated_at:time,reviewed_at:null,verified_original_applied_at:null}));return applicationId;
}
const approval=(applicationId:string,override=false)=>({applicationId,confirmAge:true,confirmEligibility:true,confirmHospitality:true,confirmLicence:true,...(override?{superAdminOverride:true}:{})});
try{
 status(await call('membership/applications',undefined,false),401);
 status(await call('admin/login',{password:'wrong'},false),401);
 const login=await call('admin/login',{password:process.env.ADMIN_PASSWORD},false);status(login,200);staff=login.cookie;
 status(await call('membership/applications',undefined,true,{Cookie:staff+'.tampered'}),401);
 status(await call('membership/capacity',{customersInside:0},true,{Origin:'https://evil.example'}),403);
 status(await call('membership/apply',{fullName:'Invalid'},false),400);
 status(await call('membership/apply',{fullName:'Form applicant',contactMethod:'email',contactValue:'test-form@example.invalid',hospitalityRole:'Test hospitality',confirmAdult:true,acceptRules:true,acceptPrivacy:true},false),201);
 status(await call('membership/apply',{fullName:'Form applicant',contactMethod:'email',contactValue:'test-form@example.invalid',hospitalityRole:'Test hospitality',confirmAdult:true,acceptRules:true,acceptPrivacy:true},false),200);
 const early=await application(47),mature=await application(49);
 status(await call('membership/members/approve',approval(early)),409);
 status(await call('membership/members/approve',approval(early,true)),403);
 const member=status(await call('membership/members/approve',approval(mature)),201).member;
 status(await call('membership/members/approve',approval(mature)),409);
 const concurrent=await application(49);
 const raced=await Promise.all([call('membership/members/approve',approval(concurrent)),call('membership/members/approve',approval(concurrent))]);
 assert.deepEqual(raced.map(r=>r.status).sort(),[201,409]);checks++;
 const challenge=status(await call('membership/superadmin/challenge',{}),200);assert.deepEqual(emailTo,['members@amicasoho.com']);assert.match(emailCode,/^\d{6}$/);checks++;
 status(await call('membership/superadmin/verify',{challenge:challenge.challenge,code:emailCode==='000000'?'111111':'000000'}),403);
 const verified=await call('membership/superadmin/verify',{challenge:challenge.challenge,code:emailCode});status(verified,200);superCookie=verified.cookie;
 assert.equal(status(await call('membership/identity'),200).superAdmin,true);checks++;
 status(await call('membership/superadmin/verify',{challenge:challenge.challenge,code:emailCode}),403);
 const auditBefore=(await list('audit_events','occurred_at',10000)).length;
 status(await call('membership/members/approve',approval(early,true)),201);
 assert.equal((await list('audit_events','occurred_at',10000)).length,auditBefore);checks++;
 status(await call('membership/superadmin/logout',{}),200);assert.equal(status(await call('membership/identity'),200).superAdmin,false);checks++;
 const secondChallengeId=randomUUID().replaceAll('-','')+randomUUID().replaceAll('-','');
 const wrongSessionId=randomUUID().replaceAll('-','')+randomUUID().replaceAll('-',''),sessionExpiry=Date.now()+60000;
 await atomic(async unit=>unit.set('superadmin_sessions',wrongSessionId,{email:'another@example.invalid',expires:sessionExpiry,revoked:false}));
 const {createHmac}=await import('node:crypto');
 const forged=wrongSessionId+'.'+sessionExpiry;
 superCookie='amica_superadmin='+forged+'.'+createHmac('sha256',process.env.ADMIN_SESSION_SECRET!).update('superadmin:'+forged).digest('hex');
 assert.equal(status(await call('membership/identity'),200).superAdmin,false);checks++;
 const newer=await application(1);status(await call('membership/members/approve',approval(newer,true)),403);
 const issued=status(await call('membership/members/'+member.id+'/pass',{}),200);const token=new URL(issued.passUrl).hash.slice(3);
 status(await call('membership/pass/view',{token},false),200);
 status(await call('membership/passes/verify',{token}),200);
 status(await call('membership/passes/verify',{token:'A'.repeat(43)}),403);
 const rotated=status(await call('membership/members/'+member.id+'/pass',{}),200);const current=new URL(rotated.passUrl).hash.slice(3);
 status(await call('membership/pass/view',{token},false),403);
 status(await call('membership/pass/view',{token:current},false),200);
 await atomic(async unit=>{const p=await unit.get('pass_credentials',member.id);unit.set('pass_credentials',member.id,{...p,expires_at:new Date(Date.now()-1).toISOString()});});
 status(await call('membership/pass/view',{token:current},false),403);
 await call('membership/members/'+member.id+'/pass',{});
 const visit=status(await call('membership/attendance/check-in',{memberId:member.id,kind:'member'}),201).visit;
 status(await call('membership/attendance/check-in',{memberId:member.id,kind:'member'}),409);
 const g1=status(await call('membership/attendance/check-in',{memberId:member.id,kind:'guest',guestName:'First guest'}),201).visit;
 status(await call('membership/attendance/check-in',{memberId:member.id,kind:'guest',guestName:'Second guest'}),201);
 status(await call('membership/attendance/check-in',{memberId:member.id,kind:'guest',guestName:'Third guest'}),409);
 status(await call('membership/attendance/'+g1.id+'/smoking',{action:'return'}),409);
 status(await call('membership/attendance/'+g1.id+'/smoking',{action:'leave'}),200);
 status(await call('membership/attendance/'+g1.id+'/smoking',{action:'return'}),200);
 status(await call('membership/capacity',{customersInside:1}),409);
 status(await call('membership/capacity',{customersInside:80}),200);
 status(await call('membership/proprietor-guests',{fullName:'Proprietor test',reason:'Testing register',authorisedBy:'Integration',identityChecked:true}),409);
 status(await call('membership/capacity',{customersInside:3}),200);
 const proprietor=status(await call('membership/proprietor-guests',{fullName:'Proprietor test',reason:'Testing register',authorisedBy:'Integration',identityChecked:true}),201).guest;
 status(await call('membership/proprietor-guests/'+proprietor.id+'/smoking',{action:'leave'}),200);
 status(await call('membership/proprietor-guests/'+proprietor.id+'/smoking',{action:'return'}),200);
 status(await call('membership/proprietor-guests/'+proprietor.id+'/check-out',{}),200);
 const exported=await call('membership/attendance/export-31-days');status(exported,200);assert.match(exported.data,/First guest/);checks++;
 const exited=status(await call('membership/attendance/'+visit.id+'/check-out',{}),200);assert.equal(exited.count,3);checks++;
 status(await call('membership/members/'+member.id+'/pass/revoke',{}),200);
 status(await call('membership/incidents',{category:'Other',description:'Integration-only incident record.'}),201);
 status(await call('membership/rule-versions',{version:'integration',title:'Test rules',body:'Integration-only draft, never approved or published.'}),201);
 for(const path of ['overview','applications','members','attendance','capacity','incidents','activity','proprietor-guests','rule-versions'])status(await call('membership/'+path),200);
 console.log('PASS: '+checks+' membership authentication, transaction and user-flow checks against isolated Firestore test collections.');
}finally{
 server.close();
 // The test runner owns only this random namespace; never removes operational records.
 const prefix=process.env.MEMBERSHIP_TEST_PREFIX!;assert.match(prefix,/^e2e_amica_\d+_$/);
 for(const collection of await membershipStore().listCollections())if(collection.id.startsWith(prefix))await membershipStore().recursiveDelete(collection);
 await membershipStore().terminate();
}
