import crypto from 'node:crypto';
import { prisma } from '../../src/backend/db/prisma';

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
    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_KEY.test(key)) output[key] = '[REDACTED]';
      else output[key] = sanitize(child);
    }
    return output;
  }
  return value;
}

function canonical(event: Omit<AuditEventInput, 'metadata'> & { metadata?: JsonValue; createdAt: string }): string {
  return JSON.stringify({
    actorId: event.actorId,
    role: event.role,
    action: event.action,
    resource: event.resource,
    resourceId: event.resourceId ?? '',
    outcome: event.outcome,
    requestId: event.requestId ?? '',
    ipAddress: event.ipAddress ?? '',
    device: event.device ?? '',
    beforeState: event.beforeState ?? null,
    afterState: event.afterState ?? null,
    metadata: event.metadata ?? null,
    createdAt: event.createdAt,
  });
}

export class AuditService {
  static async record(input: AuditEventInput) {
    if (!input.actorId || !input.role || !input.action || !input.resource || !input.outcome) {
      throw new Error('Invalid audit event');
    }

    const createdAt = new Date();
    const safeBefore = input.beforeState ? sanitize(input.beforeState) : undefined;
    const safeAfter = input.afterState ? sanitize(input.afterState) : undefined;
    const safeMetadata = input.metadata ? sanitize(input.metadata) : undefined;
    const material = canonical({ ...input, beforeState: safeBefore, afterState: safeAfter, metadata: safeMetadata, createdAt: createdAt.toISOString() });
    const integrityHash = crypto.createHash('sha256').update(material, 'utf8').digest('hex');

    return prisma.auditLog.create({
      data: {
        actor: input.actorId,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? '',
        outcome: input.outcome,
        requestId: input.requestId,
        beforeState: safeBefore,
        afterState: safeAfter,
        metadata: safeMetadata,
        integrityHash,
        ipAddress: input.ipAddress,
        device: input.device,
        createdAt,
      },
    });
  }

  static verifyIntegrity(record: {
    actor: string; action: string; resource: string; resourceId: string;
    outcome: string; requestId: string | null; ipAddress: string | null;
    device: string | null; beforeState: unknown; afterState: unknown; metadata: unknown;
    createdAt: Date; integrityHash: string;
  }) {
    const material = canonical({
      actorId: record.actor,
      role: 'UNKNOWN',
      action: record.action,
      resource: record.resource,
      resourceId: record.resourceId,
      outcome: record.outcome as AuditOutcome,
      requestId: record.requestId ?? undefined,
      ipAddress: record.ipAddress ?? undefined,
      device: record.device ?? undefined,
      beforeState: record.beforeState as JsonValue,
      afterState: record.afterState as JsonValue,
      metadata: record.metadata as JsonValue,
      createdAt: record.createdAt.toISOString(),
    });
    const expected = crypto.createHash('sha256').update(material, 'utf8').digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(record.integrityHash, 'hex'));
  }
}
