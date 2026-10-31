import test from 'node:test';
import assert from 'node:assert/strict';
import { db, type ReservationRow } from './db.js';
import { sendReservationEmail, checkEmailServiceStatus } from './emailService.js';

const reservation = {booking_id:'AMICA-TEST',guest_name:'Test Guest',email:'guest@example.com',phone:'000',guests:2,reservation_date:'2026-10-21',time_slot:'19:00',seating_area:'Vault Dining',status:'Confirmed',created_at:new Date().toISOString()} as ReservationRow;
// Isolate all external services. These tests never connect to the database or email provider.
db.query = (async () => ({rows:[],rowCount:0,command:'INSERT',oid:0,fields:[]})) as typeof db.query;
const originalFetch = globalThis.fetch;
const keys = ['RESEND_API_KEY','SENDGRID_API_KEY','SMTP_HOST','SMTP_USER','SMTP_PASS','FROM_EMAIL','BOOKING_NOTIFICATION_EMAIL'];
const originalEnv = keys.map(key => [key,process.env[key]] as const);
for (const key of keys) delete process.env[key];
test.after(() => { globalThis.fetch=originalFetch; for (const [key,value] of originalEnv) {if(value===undefined)delete process.env[key];else process.env[key]=value;} });

test('no provider never claims email delivery', async () => {
  assert.equal(checkEmailServiceStatus().ready,false);
  assert.equal((await sendReservationEmail(reservation)).success,false);
});
test('Resend sends customer confirmation with private venue copy and reply address', async () => {
  process.env.RESEND_API_KEY='test-only-key';
  let payload:any;
  globalThis.fetch=(async (_url,options) => {payload=JSON.parse(String(options?.body));return new Response(JSON.stringify({id:'test-message'}),{status:200});}) as typeof fetch;
  const result=await sendReservationEmail(reservation);
  assert.equal(result.success,true);
  assert.deepEqual(payload.to,['guest@example.com']);
  assert.deepEqual(payload.bcc,['reservations@amicasoho.com']);
  assert.equal(payload.reply_to,'reservations@amicasoho.com');
  assert.equal(result.externalId,'test-message');
});
test('venue as customer does not receive a duplicate BCC', async () => {
  let payload:any;
  globalThis.fetch=(async (_url,options) => {payload=JSON.parse(String(options?.body));return new Response(JSON.stringify({id:'test-message'}),{status:200});}) as typeof fetch;
  await sendReservationEmail({...reservation,email:'reservations@amicasoho.com'});
  assert.equal(payload.bcc,undefined);
});
test('unverified sender failure does not retry with a different identity or claim success', async () => {
  let attempts=0;
  globalThis.fetch=(async () => {attempts++;return new Response(JSON.stringify({message:'Domain not verified'}),{status:403});}) as typeof fetch;
  const result=await sendReservationEmail(reservation);
  assert.equal(result.success,false);
  assert.equal(attempts,1);
});
test('pending reservations never send a confirmed email', async () => {
  globalThis.fetch=(async () => {throw new Error('must not call provider');}) as typeof fetch;
  assert.equal((await sendReservationEmail({...reservation,status:'Pending'})).success,false);
});
