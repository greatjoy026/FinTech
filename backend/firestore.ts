import crypto from 'crypto';
import fs from 'fs';

type FirestoreValue = Record<string, unknown>;
type ServiceAccount = { project_id: string; client_email: string; private_key: string };

function loadServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) return JSON.parse(raw) as ServiceAccount;
  const file = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (file) return JSON.parse(fs.readFileSync(file, 'utf8')) as ServiceAccount;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (clientEmail && privateKey && projectId) return { project_id: projectId, client_email: clientEmail, private_key: privateKey };
  throw new Error('Trusted Firestore credentials are not configured');
}

function databaseId(): string {
  const value = process.env.FIRESTORE_DATABASE_ID?.trim();
  if (!value) throw new Error('FIRESTORE_DATABASE_ID is not configured');
  return value;
}

let cachedToken: { value: string; expiresAt: number } | null = null;
const base64Url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const sa = loadServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  const assertion = `${header}.${payload}.${base64Url(signer.sign(sa.private_key))}`;
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
  if (!response.ok) throw new Error(`Google OAuth token request failed (${response.status})`);
  const body = await response.json() as { access_token: string; expires_in: number };
  cachedToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return body.access_token;
}

function encode(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'bigint') return { integerValue: value.toString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value as object).map(([k, v]) => [k, encode(v)])) } };
  throw new Error(`Unsupported Firestore value type: ${typeof value}`);
}

function decode(value: any): any {
  if (!value) return null;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return new Date(value.timestampValue);
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([k, v]) => [k, decode(v)]));
  return value;
}

function documentPath(collection: string, id?: string) {
  const project = process.env.FIREBASE_PROJECT_ID ?? loadServiceAccount().project_id;
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/${encodeURIComponent(databaseId())}/documents/${collection}${id ? `/${encodeURIComponent(id)}` : ''}`;
}

async function request(url: string, init: RequestInit = {}) {
  const token = await accessToken();
  const response = await fetch(url, { ...init, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers ?? {}) } });
  if (!response.ok) throw new Error(`Firestore request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}

export class FirestoreServer {
  static async set(collection: string, id: string, data: Record<string, unknown>) {
    return request(documentPath(collection, id), { method: 'PATCH', body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)])) }) });
  }
  static async delete(collection: string, id: string) { return request(documentPath(collection, id), { method: 'DELETE' }); }
  static async findByField(collection: string, field: string, value: unknown) {
    const parent = documentPath(collection).replace(/\/[^/]+$/, '');
    const response = await request(`${parent}:runQuery`, { method: 'POST', body: JSON.stringify({ structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: encode(value) } }, limit: 20 } }) });
    return (response as any[]).filter(x => x.document).map(x => ({ id: x.document.name.split('/').pop(), data: Object.fromEntries(Object.entries(x.document.fields ?? {}).map(([k, v]) => [k, decode(v)])) }));
  }
  static async get(collection: string, id: string) {
    const response = await request(documentPath(collection, id));
    return { id, data: Object.fromEntries(Object.entries(response.fields ?? {}).map(([k, v]) => [k, decode(v)])) };
  }
}
