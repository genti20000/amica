import pg from 'pg';
import { supabaseCa } from './supabaseCa.js';

// Independent database for membership: never fall back to the restaurant booking DB.
// Configure MEMBERSHIP_POSTGRES_URL in Vercel after provisioning the dedicated Supabase project.
const raw=process.env.MEMBERSHIP_POSTGRES_URL;
const url=raw?new URL(raw):null;
if(url){url.searchParams.delete('sslmode');url.searchParams.delete('pgbouncer');}
export const membershipDb=new pg.Pool({
  connectionString:url?.toString(),
  ssl:{ca:supabaseCa,rejectUnauthorized:true},
  max:3,
  connectionTimeoutMillis:10000,
  idleTimeoutMillis:10000,
});
export function requireMembershipDatabase(){
  if(!raw)throw new Error('Dedicated membership database is not configured. Set MEMBERSHIP_POSTGRES_URL.');
}
export async function membershipTransaction<T>(fn:(client:pg.PoolClient)=>Promise<T>):Promise<T>{
  requireMembershipDatabase();
  const client=await membershipDb.connect();
  try{
    await client.query('BEGIN');
    const value=await fn(client);
    await client.query('COMMIT');
    return value;
  }catch(error){
    await client.query('ROLLBACK');
    throw error;
  }finally{client.release();}
}
