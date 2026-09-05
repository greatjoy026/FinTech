# CORE-001 Operational Risk Register

Use this register as the controlled starting point for production risk management. The entries below are baseline risks; owners must be mapped to named accountable operators before production go-live.

| Risk ID | Risk | Likelihood | Impact | Inherent | Key mitigation | Accountable owner | Review |
|---|---|---|---|---|---|---|---|
| RISK-001 | Unauthorized privileged access | Medium | Critical | High | Server-authoritative RBAC, privileged allow-list, audit trail, periodic access review | Security owner | Monthly |
| RISK-002 | Credential/secret leakage | Medium | Critical | High | Secret hygiene, artifact scan, redacted logs, managed secret injection | Platform owner | Monthly |
| RISK-003 | Production deployment introduces security regression | Medium | High | High | CORE-001 gates, controlled release workflow, immutable artifacts | Release owner | Every release |
| RISK-004 | Database outage or corruption | Low/Medium | Critical | High | Readiness checks, backups, restore procedure, RPO/RTO targets | DB/Operations owner | Monthly + quarterly drill |
| RISK-005 | Queue/Redis outage causes delayed asynchronous work | Medium | High | High | Durable jobs, retry/backoff, production Redis requirement, recovery runbook | Platform owner | Monthly |
| RISK-006 | Security incident is detected but not escalated | Medium | High | High | Security event taxonomy, alert thresholds, incident matrix and evidence retention | Incident owner | Quarterly |
| RISK-007 | Third-party provider introduces security/compliance risk | Medium | High | High | Vendor assessment, contract/security review, least privilege, monitoring | Vendor owner | Before activation + annually |
| RISK-008 | Excessive or stale production access | Medium | High | High | Monthly access review, separation of duties, removal workflow | Access owner | Monthly |
| RISK-009 | Unapproved security exception persists indefinitely | Medium | High | High | Exception expiry, compensating controls, explicit risk acceptance | Security owner | Monthly |
| RISK-010 | Regulatory/privacy obligation is missed | Low/Medium | Critical | High | Jurisdiction-specific legal/compliance review before go-live and material changes | Compliance/legal owner | Quarterly + on change |
| RISK-011 | Backup cannot be restored when required | Low | Critical | High | Restore drills, backup integrity evidence, documented recovery sequence | DB/Operations owner | Quarterly |
| RISK-012 | Fraud/abuse control degradation is not detected | Medium | High | High | Abuse/rate-limit telemetry, security events, incident escalation | Security/Operations owner | Monthly |

## Risk scoring

Use a 1–5 scale for likelihood and impact. Inherent risk is the pre-control assessment. Residual risk is calculated after considering implemented controls and documented assumptions. High/critical residual risk requires explicit acceptance by the accountable risk owner and security leadership before production exposure.

## Required lifecycle

1. Identify and assign an owner.
2. Score likelihood and impact.
3. Record preventive/detective controls.
4. Record evidence source and review date.
5. Reassess residual risk.
6. Accept, mitigate, transfer, or avoid the risk.
7. Track remediation to closure or approved expiry.
8. Reopen/reassess after incidents, material architecture changes, or provider changes.
