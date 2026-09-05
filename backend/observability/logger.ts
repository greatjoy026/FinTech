import crypto from 'crypto';

const SECRET_KEY = /(authorization|cookie|token|secret|password|passcode|otp|private.?key|api.?key|refresh|access.?token|card|cvv|cvc)/i;

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.slice(0, 50).map(sanitize);
  if (!value || typeof value !== 'object') return typeof value === 'string' ? value.slice(0, 2048) : value;
  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(input).slice(0, 100)) {
    output[key] = SECRET_KEY.test(key) ? '[REDACTED]' : sanitize(item);
  }
  return output;
}

export function securityHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function log(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    service: 'fintech-api',
    event,
    ...sanitize(fields) as Record<string, unknown>,
  };
  const line = JSON.stringify(record);
  if (level === 'ERROR') console.error(line);
  else if (level === 'WARN' || level === 'SECURITY') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, fields?: Record<string, unknown>) => log('INFO', event, fields),
  warn: (event: string, fields?: Record<string, unknown>) => log('WARN', event, fields),
  error: (event: string, fields?: Record<string, unknown>) => log('ERROR', event, fields),
  security: (event: string, fields?: Record<string, unknown>) => log('SECURITY', event, fields),
};
