import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
process.env.NODE_ENV='test';process.env.MEMBERSHIP_TEST_PREFIX='e2e_recovery_'+Date.now()+'_';
const {atomic,read,col,membershipStore}=await import('../server/membershipFirestore.js');
const {recoverLegacyApplications}=await import('../server/membershipLegacyRecovery.js');
const source=(status='pending')=>({id:randomUUID(),full_name:'Recovery test',contact_method:'email',contact_value:randomUUID()+'@example.invalid',created_at:'2026-11-02T10:00:00.000Z',updated_at:'2026-11-03T10:00:00.000Z',rules_accepted_at:'2026-11-02T10:00:00.000Z',is_adult:true,status,review_note:'Original note',reviewed_at:null});
try{
 const bad=source();bad.created_at='invalid';await assert.rejects(()=>recoverLegacyApplications(async()=>[bad]));assert.equal(await read('applications',bad.id),null);
 const old=source(),reviewed=source('reviewed'),existing=source();
 await atomic(async u=>u.set('applications',existing.id,{...existing,status:'approved',review_note:'Live decision'}));
 const result=await recoverLegacyApplications(async()=>[old,reviewed,existing]);
 assert.equal(result.copied,2);assert.equal(result.already_present,1);assert.equal(result.verified,3);
 assert.equal((await read('applications',old.id))?.created_at,old.created_at);assert.equal((await read('applications',reviewed.id))?.status,'reviewed');assert.equal((await read('applications',reviewed.id))?.review_note,'Original note');
 assert.equal((await read('applications',existing.id))?.status,'approved');assert.equal((await read('applications',existing.id))?.review_note,'Live decision');assert.equal((await read('legacy_application_backups',existing.id))?.status,'pending');
 let loaded=false;await recoverLegacyApplications(async()=>{loaded=true;return []});assert.equal(loaded,false);
 assert.equal((await col('members').get()).size,0);assert.equal((await col('approval_emails').get()).size,0);
 console.log('PASS: recovery validates first, copies missing records, preserves original dates/status/notes and live decisions, backs up sources, creates no memberships/emails, and reruns without reading SQL.');
}finally{
 const fs=membershipStore();for(const c of await fs.listCollections())if(c.id.startsWith(process.env.MEMBERSHIP_TEST_PREFIX!))await fs.recursiveDelete(c);await fs.terminate();
}
