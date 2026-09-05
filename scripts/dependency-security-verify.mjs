import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = path.join(root, 'package.json');
const lockPath = path.join(root, 'package-lock.json');

function fail(message) {
  console.error(`SEC-012 dependency gate FAILED: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(packagePath)) fail('package.json is missing');
if (!fs.existsSync(lockPath)) fail('package-lock.json is missing');

let pkg;
let lock;
try {
  pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
} catch (error) {
  fail(`manifest or lockfile is invalid JSON: ${error instanceof Error ? error.message : 'unknown error'}`);
}

if (lock.lockfileVersion !== 3) fail(`expected npm lockfileVersion 3, found ${lock.lockfileVersion}`);

const rootPackage = lock.packages?.[''];
if (!rootPackage) fail('lockfile root package entry is missing');

const manifestDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}), ...(pkg.optionalDependencies ?? {}) };
const lockDeps = { ...(rootPackage.dependencies ?? {}), ...(rootPackage.devDependencies ?? {}), ...(rootPackage.optionalDependencies ?? {}) };

const missingFromLock = Object.keys(manifestDeps).filter(name => lockDeps[name] !== manifestDeps[name]);
const staleInLock = Object.keys(lockDeps).filter(name => manifestDeps[name] !== lockDeps[name]);

if (missingFromLock.length || staleInLock.length) {
  if (missingFromLock.length) console.error(`- package.json dependency specs missing/different in lockfile: ${missingFromLock.join(', ')}`);
  if (staleInLock.length) console.error(`- lockfile root contains undeclared/different dependency specs: ${staleInLock.join(', ')}`);
  fail('package.json and package-lock.json root dependency specifications are not synchronized');
}

const lockedPackages = Object.entries(lock.packages ?? {}).filter(([name]) => name.startsWith('node_modules/'));
for (const [name, entry] of lockedPackages) {
  // npm can represent optional/platform-specific nested entries without their own
  // registry URL/integrity when the parent package supplies the artifact metadata.
  if (entry.link === true) continue;
  if (entry.resolved && !entry.integrity) {
    fail(`locked package ${name.replace(/^node_modules\//, '')} has a resolved registry URL but no integrity metadata`);
  }
  if (!entry.resolved && !entry.integrity && !entry.optional) {
    const isNestedPlatformMetadata = name.includes('/node_modules/') || name.includes('node_modules/@') && name.includes('/');
    if (!isNestedPlatformMetadata) {
      fail(`locked package ${name.replace(/^node_modules\//, '')} has neither resolved nor integrity metadata`);
    }
  }
}

const npmrcPath = path.join(root, '.npmrc');
if (fs.existsSync(npmrcPath)) {
  const npmrc = fs.readFileSync(npmrcPath, 'utf8');
  if (/registry\s*=\s*(?!https:\/\/registry\.npmjs\.org\/?\s*$)/m.test(npmrc)) {
    fail('project .npmrc changes the npm registry away from the trusted public registry');
  }
}

const packageScripts = pkg.scripts ?? {};
for (const [name, command] of Object.entries(packageScripts)) {
  if (/curl\s+[^|]*\|\s*(sh|bash)|wget\s+[^|]*\|\s*(sh|bash)/i.test(command)) {
    fail(`package script ${name} pipes a remote download directly into a shell`);
  }
}

console.log(`SEC-012 dependency gate PASSED (${lockedPackages.length} locked package entries inspected)`);
