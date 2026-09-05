# CORE-001 SEC-012 — Dependency & Supply-Chain Security

## Status

Implemented on `remediation/core-001-sec012-supply-chain`.

## Controls

- `npm ci` is the CI installation contract; CI does not silently regenerate or rewrite the lockfile.
- `package.json` and `package-lock.json` root dependency specifications are checked by `scripts/dependency-security-verify.mjs`.
- Lockfile version 3 is required.
- Locked registry packages are expected to retain integrity metadata; platform/optional npm entries are handled explicitly.
- Project registry configuration is rejected if `.npmrc` redirects the project to an unapproved registry.
- Package scripts are rejected when they pipe remote `curl`/`wget` downloads directly into a shell.
- `npm audit --audit-level=high` is a blocking CI gate.
- GitHub Dependency Review is configured for pull requests targeting `main`, failing on high-severity runtime dependency findings.
- Known vulnerable transitive packages were remediated through patched dependency versions/overrides and a regenerated lockfile.
- No vulnerability is suppressed merely to make CI green.

## Dependency update policy

1. Prefer the latest stable patched release within the existing major line.
2. Major upgrades require compatibility review and full TypeScript/build/security verification.
3. Runtime high/critical vulnerabilities block merge unless an explicit, bounded exception is approved and documented.
4. Dev-only vulnerabilities are still tracked; they are not treated as a reason to weaken runtime controls.
5. Dependency changes must be committed together with the lockfile.
6. Dependency sources must remain trusted and reviewable.

## Trust boundary

Dependencies are third-party executable code. The lockfile, npm registry configuration, package lifecycle scripts, and CI installation policy are therefore part of the software trust boundary. A clean application source tree is not sufficient if an unreviewed or vulnerable dependency can be introduced during installation.

## Current verification

The final CORE-001 Security Gate passed the existing security suite plus the SEC-012 dependency integrity and vulnerability gates. The verified run used frozen `npm ci`, the dependency integrity gate, `npm audit --audit-level=high`, TypeScript, production build, and browser-artifact secret scanning.

## Scope exclusions

Wallet, ledger, payment-provider, settlement, product, inventory, and Monime implementation were not redesigned as part of SEC-012. Monime remains deferred by project decision.
