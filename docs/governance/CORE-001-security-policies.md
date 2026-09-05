# CORE-001 Security Governance Policies

## Access governance
- Production access is least-privilege and time-bounded where technically possible.
- Privileged access is reviewed monthly.
- Joiner/mover/leaver changes must be reflected promptly; terminated access is revoked without waiting for the next review.
- Shared production accounts are prohibited unless technically unavoidable and explicitly approved.
- Break-glass access must be separately controlled, monitored, time-limited, and reviewed after every use.
- MFA is required for human production administration where supported by the identity provider.

## Change governance
- Security-sensitive changes require review by the designated code owner when CODEOWNERS enforcement is enabled.
- Production changes must originate from a reviewed commit and controlled release process.
- Emergency changes require retrospective review, evidence, and risk assessment.
- Database migrations must be reviewed for backward compatibility and rollback implications before release.

## Incident response
Severity is assigned using customer impact, financial/security impact, scope, persistence, and regulatory implications. Critical security incidents require an incident commander, containment, evidence preservation, stakeholder notification, recovery, and post-incident review. Legal/regulatory notification decisions must be made by the appropriate compliance/legal owner based on the applicable jurisdiction and contractual obligations.

## Security exceptions
Every exception must contain: unique ID, affected control, reason, risk assessment, accountable owner, compensating controls, approval, start date, expiry date, and closure evidence. Exceptions cannot silently become permanent controls. Expired exceptions are treated as control failures until renewed through explicit review.

## Data protection
Collect and retain only data required for the stated business purpose. Sensitive values must not appear in logs, CI artifacts, audit metadata, issue comments, or evidence packages. Access to production data is restricted and reviewed. Retention periods must be set according to business, contractual, legal, and regulatory requirements; where those requirements are unknown, the system owner must obtain a documented determination before go-live.

## Vendor and provider risk
A third-party provider must have an owner, documented purpose, data-flow assessment, security/compliance review, contractual safeguards where applicable, credential/secrets controls, incident contacts, and exit/dependency plan before production activation. Monime remains a deferred integration and is not approved merely by this governance baseline.

## Compliance boundary
These policies are an internal governance baseline. They are not a legal opinion and do not constitute ISO 27001, SOC 2, PCI DSS, banking, payments, privacy, or other regulatory certification. Applicable obligations must be mapped by qualified legal/compliance personnel before production launch.
