import crypto from 'node:crypto';
import { prisma } from '../../src/backend/db/prisma';
import { FirestoreServer } from '../firestore';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type AuditOutcome = 'SUCCESS' | 'FAILURE' | 'DENIED' | 'RATE_LIMITED';

export interface AuditEventInput {
  actorId: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: AuditOutcome;
  requestId?: string;
  ipAddress?: string;
  device?: string;
  beforeState?: JsonValue;
  afterState?: JsonValue;
  metadata?: Record<string, JsonValue>;
}

const SENSITIVE_KEY = /(authorization|cookie|token|secret|password|passcode|otp|refresh|access[_-]?token|private[_-]?key|api[_-]?key|card|cvv|cvc)/i;

function sanitize(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    const output: Record<string, JsonValue> = {};
    for (const [key, child] of Object.entries(value)) output[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : sanitize(child);
    return output;
  }
  return value;
}

function canonical(event: {
  actorId: string; role: string; action: string; resource: string; resourceId: string;
  outcome: AuditOutcome; requestId?: string; ipAddress?: string; device?: string;
  beforeState?: JsonValue; afterState?: JsonValue; metadata?: JsonValue; createdAt: string;
}) {
  return JSON.stringify(event);
}

function digest(event: Parameters<typeof canonical>[0]) {
  return crypto.createHash('sha256').update(canonical(event), 'utf8').digest('hex');
}

export class AuditService {
  static async record(input: AuditEventInput) {
    if (!input.actorId || !input.role || !input.action || !input.resource || !input.outcome) throw new Error('Invalid audit event');
    const createdAt = new Date();
    const safeBefore = input.beforeState ? sanitize(input.beforeState) : undefined;
    const safeAfter = input.afterState ? sanitize(input.afterState) : undefined;
    const safeMetadata = input.metadata ? sanitize(input.metadata) : undefined;
    const metadata: Record<string, JsonValue> = { ...(safeMetadata as Record<string, JsonValue> | undefined), _actorRole: input.role };
    const material = { actorId: input.actorId, role: input.role, action: input.action, resource: input.resource, resourceId: input.resourceId ?? '', outcome: input.outcome, requestId: input.requestId, ipAddress: input.ipAddress, device: input.device, beforeState: safeBefore, afterState: safeAfter, metadata, createdAt: createdAt.toISOString() };
    return prisma.auditLog.create({ data: { actor: input.actorId, action: input.action, resource: input.resource, resourceId: input.resourceId ?? '', outcome: input.outcome, requestId: input.requestId, beforeState: safeBefore, afterState: safeAfter, metadata, integrityHash: digest(material), ipAddress: input.ipAddress, device: input.device, createdAt } });
  }

  static async logAction(input: {
    actor: string;
    action: string;
    resource: string;
    resourceId: string;
    beforeState?: JsonValue;
    afterState?: JsonValue;
    ipAddress?: string;
    device?: string;
  }) {
    const user = await FirestoreServer.get('users', input.actor);
    const role = typeof user?.data?.role === 'string' ? user.data.role : '';
    if (!role) throw new Error('Audit actor role unavailable');
    return this.record({
      actorId: input.actor,
      role,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      outcome: 'SUCCESS',
      ipAddress: input.ipAddress,
      device: input.device,
      beforeState: input.beforeState,
      afterState: input.afterState,
    });
  }

  static verifyIntegrity(record: {
    actor: string; action: string; resource: string; resourceId: string; outcome: string;
    requestId: string | null; ipAddress: string | null; device: string | null;
    beforeState: unknown; afterState: unknown; metadata: unknown; createdAt: Date; integrityHash: string;
  }) {
    const metadata = (record.metadata && typeof record.metadata === 'object' ? record.metadata : {}) as Record<string, JsonValue>;
    const role = typeof metadata._actorRole === 'string' ? metadata._actorRole : '';
    if (!role || !/^[a-f0-9]{64}$/i.test(record.integrityHash)) return false;
    const expected = digest({ actorId: record.actor, role, action: record.action, resource: record.resource, resourceId: record.resourceId, outcome: record.outcome as AuditOutcome, requestId: record.requestId ?? undefined, ipAddress: record.ipAddress ?? undefined, device: record.device ?? undefined, beforeState: record.beforeState as JsonValue, afterState: record.afterState as JsonValue, metadata, createdAt: record.createdAt.toISOString() });
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(record.integrityHash, 'hex'));
  }
}
