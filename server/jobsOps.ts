import type { Express, Request, Response } from 'express';
import { db } from './db.js';
import { ensureJobsTables, JOB_SLUGS, JOB_APPLICATION_ROLES, JOB_STATUSES } from './jobsStore.js';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const failure=(res:Response,e:unknown)=> {
  console.error('[AMICA jobs admin]',e instanceof Error?e.message:'Unknown error');
  return res.status(503).json({success:false,error:'Recruitment records are temporarily unavailable.'});
};
export function installJobsAdmin(app:Express):void {
  // All routes inherit the existing signed admin cookie middleware in server.ts.
  app.get('/api/jobs/admin/overview',async(_req,res)=>{
    try{
      await ensureJobsTables();
      const [roles,totals,status]=await Promise.all([
        db.query('SELECT slug,title,is_open,updated_at FROM public.amica_job_roles ORDER BY slug'),
        db.query('SELECT count(*)::integer total, count(*) FILTER(WHERE status=\'new\')::integer new_count, count(*) FILTER(WHERE status=\'shortlisted\')::integer shortlisted_count, count(*) FILTER(WHERE status=\'interview\')::integer interview_count FROM public.amica_job_applications'),
        db.query('SELECT role_slug,status,count(*)::integer total FROM public.amica_job_applications GROUP BY role_slug,status')
      ]);
      res.json({success:true,roles:roles.rows,metrics:totals.rows[0],distribution:status.rows});
    }catch(e){failure(res,e)}
  });
  app.get('/api/jobs/admin/applications',async(req,res)=>{
    try {
      await ensureJobsTables();
      const status=typeof req.query.status==='string'?req.query.status:'all';
      const role=typeof req.query.role==='string'?req.query.role:'all';
      const search=typeof req.query.search==='string'?req.query.search.trim().slice(0,100):'';
      if(status!=='all'&&!JOB_STATUSES.includes(status as typeof JOB_STATUSES[number]))
        return res.status(400).json({success:false,error:'Unknown application status.'});
      if(role!=='all'&&!JOB_APPLICATION_ROLES.includes(role as typeof JOB_APPLICATION_ROLES[number]))
        return res.status(400).json({success:false,error:'Unknown job role.'});
      const rows=await db.query(`SELECT id,role_slug,first_name,last_name,email,phone,experience,
        availability,about,status,notes,cv_filename,email_status,created_at,updated_at
        FROM public.amica_job_applications
        WHERE ($1='all' OR status=$1) AND ($2='all' OR role_slug=$2)
        AND ($3='' OR first_name ILIKE '%'||$3||'%' OR last_name ILIKE '%'||$3||'%'
          OR email ILIKE '%'||$3||'%' OR phone ILIKE '%'||$3||'%')
        ORDER BY created_at DESC LIMIT 350`,[status,role,search]);
      res.json({success:true,applications:rows.rows,limit:350});
    }catch(e){failure(res,e)}
  });
  app.patch('/api/jobs/admin/applications/:id',async(req,res)=>{
    if(!uuid.test(req.params.id))return res.status(400).json({success:false,error:'Invalid application ID.'});
    const status=String(req.body?.status||'');
    const notes=typeof req.body?.notes==='string'?req.body.notes.trim():'';
    if(!JOB_STATUSES.includes(status as typeof JOB_STATUSES[number])||notes.length>2500)
      return res.status(400).json({success:false,error:'Invalid status or notes (max 2500 characters).'});
    try{
      await ensureJobsTables();
      const update=await db.query(`UPDATE public.amica_job_applications SET status=$2,notes=$3,updated_at=now()
        WHERE id=$1 RETURNING id,status,notes,updated_at`,[req.params.id,status,notes]);
      return update.rows.length?res.json({success:true,application:update.rows[0]})
        :res.status(404).json({success:false,error:'Application not found.'});
    }catch(e){failure(res,e)}
  });
  app.get('/api/jobs/admin/applications/:id/cv',async(req,res)=>{
    if(!uuid.test(req.params.id))return res.status(400).json({success:false,error:'Invalid application ID.'});
    try{
      await ensureJobsTables();
      const found=await db.query('SELECT cv_filename,cv_file FROM public.amica_job_applications WHERE id=$1',[req.params.id]);
      const file=found.rows[0];if(!file?.cv_file)return res.status(404).json({success:false,error:'CV not found.'});
      const name=String(file.cv_filename||'cv.pdf').replace(/[^a-z0-9._ -]/ig,'_').slice(0,100);
      const lower=name.toLowerCase();
      const type=lower.endsWith('.pdf')?'application/pdf':lower.endsWith('.docx')?'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'application/msword';
      res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
      res.setHeader('Content-Type',type);res.setHeader('Content-Disposition','attachment; filename="'+name.replace(/"/g,'')+'"');
      return res.send(file.cv_file);
    }catch(e){failure(res,e)}
  });
  app.delete('/api/jobs/admin/applications/:id',async(req,res)=>{
    if(!uuid.test(req.params.id)||req.body?.confirm!==true)return res.status(400).json({success:false,error:'Deletion confirmation is required.'});
    try{
      await ensureJobsTables();
      const done=await db.query('DELETE FROM public.amica_job_applications WHERE id=$1 RETURNING id',[req.params.id]);
      return done.rows.length?res.json({success:true,deleted:true}):res.status(404).json({success:false,error:'Application not found.'});
    }catch(e){failure(res,e)}
  });
  app.patch('/api/jobs/admin/roles/:slug',async(req,res)=>{
    const slug=String(req.params.slug||'');
    if(!JOB_SLUGS.includes(slug as typeof JOB_SLUGS[number])||typeof req.body?.is_open!=='boolean')
      return res.status(400).json({success:false,error:'Choose an existing role and open/closed status.'});
    try{
      await ensureJobsTables();
      const r=await db.query('UPDATE public.amica_job_roles SET is_open=$2,updated_at=now() WHERE slug=$1 RETURNING slug,title,is_open,updated_at',[slug,req.body.is_open]);
      res.json({success:true,role:r.rows[0]});
    }catch(e){failure(res,e)}
  });
}
