import type { Request, Response } from 'express';
import { roleIsOpen, type JobSlug } from '../server/jobsStore.js';
import { barStaffPage, floorStaffPage } from '../server/jobsTemplates.js';

export default async function jobPage(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=0, must-revalidate');
  const role = typeof req.query.role === 'string' ? req.query.role : '';
  if (req.method !== 'GET' || (role !== 'bar-staff' && role !== 'floor-staff')) {
    return res.status(404).send('<!doctype html><title>Not found · AMICA SOHO</title><p>Page not found.</p>');
  }
  try {
    const open = await roleIsOpen(role as JobSlug);
    if (!open) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      const title = role === 'bar-staff' ? 'Bar Staff' : 'Floor Staff';
      return res.status(410).send(`<!doctype html><html lang="en"><head><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vacancy closed · AMICA SOHO</title><style>body{background:#211219;color:#f9eee5;font:16px/1.7 system-ui,sans-serif;margin:0}main{max-width:650px;margin:14vh auto;padding:30px}h1{font:400 47px/1.1 Georgia,serif}a{color:#e4c091}span{font-size:12px;letter-spacing:.18em;color:#d0aa79;text-transform:uppercase}</style></head><body><main><span>AMICA SOHO · CAREERS</span><h1>${title} applications are now closed.</h1><p>Thank you for your interest. We are not accepting applications for this position at present.</p><p><a href="/careers">View our careers page</a></p></main></body></html>`);
    }
    return res.status(200).send(role === 'bar-staff' ? barStaffPage : floorStaffPage);
  } catch (error) {
    console.error('Public jobs page failed:', error instanceof Error ? error.message : 'Unknown');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.status(503).send('<!doctype html><title>AMICA SOHO · Temporarily unavailable</title><p>Our careers pages are temporarily unavailable. Please try again shortly.</p>');
  }
}
