import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/backend/payment/payment.state.ts',
  'src/backend/payment/payment.errors.ts',
  'src/backend/payment/payment.provider.ts',
  'src/backend/payment/payment.service.ts',
  'scripts/payment-invariants-verify.ts',
  'docs/architecture/CORE-004-payment-processing.md',
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) throw new Error(`Payment gate failed: missing ${file}`);
const service = fs.readFileSync(path.join(root, 'src/backend/payment/payment.service.ts'), 'utf8');
const provider = fs.readFileSync(path.join(root, 'src/backend/payment/payment.provider.ts'), 'utf8');
const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8');
for (const token of ['idempotencyKey','requestHash','PaymentTransaction','PROCESSING','SUCCEEDED','FAILED']) if (!schema.includes(token) && !service.includes(token)) throw new Error(`Payment gate failed: missing ${token}`);
if (/provider\s+String\s+@default\("monime"\)/i.test(schema)) throw new Error('Payment gate failed: Monime remains a canonical payment default');
if (!provider.includes('PaymentProviderAdapter')) throw new Error('Payment gate failed: provider boundary missing');
if (/sk_live|secret|api[_-]?key/i.test(service)) throw new Error('Payment gate failed: payment service contains prohibited secret-like configuration');
console.log('CORE-004 payment security gate: PASS');
