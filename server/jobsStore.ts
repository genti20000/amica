import { randomUUID } from 'node:crypto';
import { db } from './db.js';

// Access to recruitment records is server-side only. Do not expose these tables to anon/authenticated APIs.
let initPromise: Promise<void> | undefined;
export async function ensureJobsTables(): Promise<void> {
  if (!initPromise) initPromise = (async () => {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(`CREATE TABLE IF NOT EXISTS public.amica_job_roles (
        slug varchar(30) PRIMARY KEY,
        title varchar(100) NOT NULL,
        is_open boolean NOT NULL DEFAULT true,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`);
      await client.query(`CREATE TABLE IF NOT EXISTS public.amica_job_applications (
        id uuid PRIMARY KEY,
        role_slug varchar(30) NOT NULL,
        first_name varchar(60) NOT NULL,
        last_name varchar(60) NOT NULL,
        email varchar(150) NOT NULL,
        phone varchar(40) NOT NULL,
        experience varchar(50) NOT NULL DEFAULT '',
        availability varchar(50) NOT NULL DEFAULT '',
        about text NOT NULL DEFAULT '',
        status varchar(20) NOT NULL DEFAULT 'new',
        notes varchar(2500) NOT NULL DEFAULT '',
        cv_filename varchar(100),
        cv_file bytea,
        consent_at timestamptz NOT NULL,
        email_status varchar(20) NOT NULL DEFAULT 'pending',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT amica_job_role_valid CHECK(role_slug IN ('bar-staff','floor-staff','either')),
        CONSTRAINT amica_job_status_valid CHECK(status IN ('new','reviewing','shortlisted','interview','hired','declined'))
      )`);
      await client.query('CREATE INDEX IF NOT EXISTS amica_jobs_created_idx ON public.amica_job_applications (created_at DESC)');
      await client.query('CREATE INDEX IF NOT EXISTS amica_jobs_status_idx ON public.amica_job_applications (status,role_slug)');
      await client.query('ALTER TABLE public.amica_job_roles ENABLE ROW LEVEL SECURITY');
      await client.query('ALTER TABLE public.amica_job_applications ENABLE ROW LEVEL SECURITY');
      await client.query('REVOKE ALL ON TABLE public.amica_job_roles, public.amica_job_applications FROM PUBLIC, anon, authenticated');
      await client.query(`INSERT INTO public.amica_job_roles (slug,title,is_open)
        VALUES ('bar-staff','Bar Staff',true),('floor-staff','Floor Staff',true)
        ON CONFLICT (slug) DO NOTHING`);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally { client.release(); }
  })().catch(error => { initPromise=undefined; throw error; });
  return initPromise;
}

export type JobSlug = 'bar-staff' | 'floor-staff';
export const JOB_SLUGS: JobSlug[] = ['bar-staff', 'floor-staff'];
export const JOB_APPLICATION_ROLES = ['bar-staff','floor-staff','either'] as const;
export const JOB_STATUSES = ['new','reviewing','shortlisted','interview','hired','declined'] as const;

export async function roleIsOpen(slug: JobSlug): Promise<boolean> {
  await ensureJobsTables();
  const result=await db.query('SELECT is_open FROM public.amica_job_roles WHERE slug=$1',[slug]);
  return result.rows[0]?.is_open === true;
}

export type JobApplicationRole = JobSlug | 'either';
export interface NewJobApplication {
  first:string;last:string;email:string;phone:string;role:JobApplicationRole;
  experience:string;availability:string;about:string;cvName?:string;cvBytes?:Buffer;
}
export async function saveJobApplication(data: NewJobApplication): Promise<string> {
  await ensureJobsTables();
  const id=randomUUID();
  await db.query(`INSERT INTO public.amica_job_applications
    (id,role_slug,first_name,last_name,email,phone,experience,availability,about,cv_filename,cv_file,consent_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())`,
    [id,data.role,data.first,data.last,data.email,data.phone,data.experience,data.availability,data.about,
      data.cvName||null,data.cvBytes||null]);
  return id;
}
export async function setJobEmailStatus(id:string,status:'sent'|'failed'):Promise<void> {
  await db.query('UPDATE public.amica_job_applications SET email_status=$2,updated_at=now() WHERE id=$1',[id,status]);
}
