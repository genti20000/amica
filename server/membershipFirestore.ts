import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore, type Transaction } from 'firebase-admin/firestore';
import { Pipelines } from '@google-cloud/firestore';
import { randomUUID } from 'node:crypto';

type Row = Record<string, any>;
let store: Firestore;
export function membershipStore() {
  if (store) return store;
  const raw = process.env.MEMBERSHIP_FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('Membership Firebase server credential is not configured.');
  const account = JSON.parse(raw);
  if (account.project_id !== 'amica-membership') throw new Error('Unexpected membership Firebase project.');
  const app = getApps().find(a => a.name === 'amica-membership') || initializeApp({credential: cert(account), projectId: account.project_id}, 'amica-membership');
  store = getFirestore(app, process.env.MEMBERSHIP_FIRESTORE_DATABASE_ID || 'default');
  return store;
}
export const col = (name: string) => membershipStore().collection((process.env.NODE_ENV !== 'production' && process.env.MEMBERSHIP_TEST_PREFIX || 'membership_') + name);
export async function read(name: string, id: string): Promise<Row | null> {
  const doc = await col(name).doc(id).get();
  return doc.exists ? doc.data() as Row : null;
}
// Enterprise pipelines perform filtering and sorting in Firestore; no public SDK or keys.
export async function list(name: string, order: string, limit = 250, since?: string): Promise<Row[]> {
  let query = membershipStore().pipeline().collection(col(name));
  if (since) query = query.where(Pipelines.field(order).greaterThanOrEqual(since));
  const result = await query.sort(Pipelines.descending(order)).limit(limit).execute();
  return result.results.map(row => row.data());
}
export class MembershipError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}
export const deny = (message: string, status = 409): never => { throw new MembershipError(message, status); };
export const instant = () => new Date().toISOString();
export const hashId = /^[a-f0-9]{8}-[a-f0-9-]{27,}$/i;
export class Unit {
  private pending = new Map<string, Row>();
  private cached = new Map<string, Row | null>();
  constructor(private tx: Transaction) {}
  async get(name: string, id: string): Promise<Row | null> {
    const key = name + '/' + id;
    if (this.pending.has(key)) return this.pending.get(key)!;
    if (!this.cached.has(key)) {
      const doc = await this.tx.get(col(name).doc(id));
      this.cached.set(key, doc.exists ? doc.data() as Row : null);
    }
    return this.cached.get(key)!;
  }
  set(name: string, id: string, value: Row) { this.pending.set(name + '/' + id, value); }
  async patch(name: string, id: string, value: Row) {
    const old = await this.get(name, id);
    if (!old) deny('Record not found.', 404);
    this.set(name, id, {...old, ...value});
  }
  audit(action: string, subject_id = '', details = '') {
    const id = randomUUID(); this.set('audit_events', id, {id, action, subject_id, details, occurred_at: instant()});
  }
  flush() {
    for (const [path, value] of this.pending) {
      const slash = path.indexOf('/');
      this.tx.set(col(path.slice(0, slash)).doc(path.slice(slash + 1)), value);
    }
  }
}
export async function atomic<T>(run: (unit: Unit) => Promise<T>): Promise<T> {
  return membershipStore().runTransaction(async tx => {
    const unit = new Unit(tx); const result = await run(unit); unit.flush(); return result;
  });
}
export async function submitApplication(application: Row, dedupe: string) {
  return atomic(async unit => {
    const prior = await unit.get('submission_limits', dedupe);
    if (prior && Date.parse(prior.created_at) > Date.now() - 12 * 3600000) return false;
    unit.set('applications', application.id, application);
    unit.set('submission_limits', dedupe, {created_at: application.created_at});
    return true;
  });
}
export async function lookupPass(tokenHash: string): Promise<Row | null> {
  const pass = await read('pass_tokens', tokenHash);
  if (!pass) return null;
  const current = await read('pass_credentials', pass.member_id);
  const member = await read('members', pass.member_id);
  if (!current || current.token_hash !== tokenHash || current.revoked_at || Date.parse(current.expires_at) <= Date.now() || member?.status !== 'active') return null;
  return {...member, member_id: member.id, expires_at: current.expires_at};
}
