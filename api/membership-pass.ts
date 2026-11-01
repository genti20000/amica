import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { lookupPass } from '../server/membershipFirestore.js';

// Public credential view: possession of an unguessable 256-bit token is required.
// All staff verification and check-ins remain separately behind admin authentication.
export default async function viewMembershipPass(req: Request,res:Response){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST')return res.status(405).json({success:false,error:'Method not allowed.'});
 const token=req.body?.token;
 if(typeof token!=='string'||!/^[a-zA-Z0-9_-]{43}$/.test(token))
  return res.status(400).json({success:false,error:'Invalid credential.'});
 try{
  const hash=createHash('sha256').update(token,'utf8').digest('hex');
  const row=await lookupPass(hash);
  if(!row||row.revoked_at||row.status!=='active'||new Date(row.expires_at).getTime()<Date.now())
   return res.status(403).json({success:false,error:'This pass is no longer valid. Please contact AMICA management.'});
  return res.json({success:true,member:{fullName:row.full_name,memberNumber:row.member_number},
   expiresAt:row.expires_at,notice:'Identity verification and admission remain subject to AMICA staff approval.'});
 }catch(error){
  console.error('Membership pass view error:',error instanceof Error?error.message:'Unknown');
  return res.status(503).json({success:false,error:'Pass verification is temporarily unavailable.'});
 }
}
