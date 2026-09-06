import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

function normalizeDatabaseUrl(raw?: string): string | undefined {
  if (!raw) return raw;
  try {
    new URL(raw);
    return raw;
  } catch {
    const match = raw.match(/^(postgres(?:ql)?:\/\/)([^:]+):([^@]+)@(.*)$/);
    if (match) {
      const [, proto, user, pass, rest] = match;
      const encodedPass = encodeURIComponent(decodeURIComponent(pass));
      return `${proto}${user}:${encodedPass}@${rest}`;
    }
    return raw;
  }
}

const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);
const pool = new Pool({ connectionString });
pool.on('error', (err) => {
  console.warn('[DB Pool] Non-fatal database client error:', err.message);
});
const adapter = new PrismaPg(pool);

// Use a singleton pattern to prevent multiple instances during hot-reloads.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Query logs may contain sensitive SQL parameters. Keep verbose query logging
    // out of production; operational errors remain available for diagnostics.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
