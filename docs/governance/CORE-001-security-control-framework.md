# CORE-001 Security Control Framework

**Status:** Repository governance baseline
**Owner:** Engineering / Security owner designated by project leadership
**Review cadence:** Quarterly and after material security incidents

## Purpose
This framework defines the minimum governance controls required to operate FinTech securely. It separates repository-enforced controls from controls that require operator, cloud, legal, regulatory, or third-party action.

## Control register

| ID | Control | Owner | Evidence | Cadence |
|---|---|---|---|---|
| GOV-001 | Security-sensitive changes require CODEOWNERS review when repository enforcement is enabled | Repository owner | PR review history | Every change |
| GOV-002 | Production releases use the controlled release workflow and immutable artifact process | Release owner | GitHub Actions run + release metadata | Every release |
| GOV-003 | Authentication and authorization regression gates pass before release | Security/Engineering | CORE-001 CI run | Every release |
| GOV-004 | Secrets/configuration gates pass and no credentials are committed | Engineering | CI security-gate output | Every change |
| GOV-005 | Dependency integrity and high/critical vulnerability gates pass | Engineering | Lockfile + npm audit + dependency gate | Every change |
| GOV-006 | Privileged operations are allow-listed, server-authorized, and audited | Security/Engineering | Code + audit evidence | Every change |
| GOV-007 | Security events and operational telemetry are correlated by request ID | Operations | Structured logs/metrics | Continuous |
| GOV-008 | Backups and recovery procedures are maintained and periodically tested | Operations/DB owner | Backup logs + restore drill evidence | At least quarterly |
| GOV-009 | Production access is reviewed and stale privileged access is removed | Access owner | Access review record | Monthly |
| GOV-010 | Security exceptions have an owner, expiry, compensating control, and risk acceptance | Security owner | Exception register | Monthly |
| GOV-011 | Material incidents follow the incident response and escalation procedure | Incident commander | Incident record/timeline | Per incident |
| GOV-012 | Third-party providers are risk-assessed before production activation | Vendor owner | Vendor assessment + contract/security evidence | Before activation + annually |

## Evidence requirements
Evidence must identify the control, period, responsible owner, system/environment, result, timestamp, and source. Do not store credentials, access tokens, raw customer secrets, payment-card data, or unnecessary personal data as evidence.

## External-control boundary
The repository does not by itself prove cloud IAM/MFA, database role separation, backup-provider configuration, TLS termination, legal compliance, regulatory registration, PCI DSS/SOC 2/ISO certification, or an external audit. Those are deployment/operator or independent-assurance responsibilities and must be evidenced separately before go-live.
