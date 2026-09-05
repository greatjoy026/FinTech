# SEC-020 Production Governance Operator Checklist

Complete this checklist before production authorization and repeat according to the stated cadence.

## Before go-live
- [ ] Applicable legal/regulatory obligations identified for every operating jurisdiction.
- [ ] Required registrations/licenses/approvals confirmed by qualified compliance/legal owners.
- [ ] Named owners assigned for security, operations, access, database/recovery, releases, vendors, incidents, and compliance.
- [ ] Production IAM uses least privilege and MFA where supported.
- [ ] Break-glass process is configured and tested.
- [ ] Production database roles and backup administration are separated where feasible.
- [ ] GitHub branch protection/rulesets and required reviews are enabled by repository administrators.
- [ ] Production environment approval rules are enabled where required.
- [ ] Backup schedules and restore drills are operational.
- [ ] Incident contacts and escalation channels are verified.
- [ ] Vendor/provider assessments and contracts are complete before activation.
- [ ] Security exceptions are either closed or explicitly approved with expiry and compensating controls.
- [ ] CORE-001 security gate passes on the exact release commit.

## Monthly
- [ ] Review production users and privileged access.
- [ ] Remove stale access.
- [ ] Review security exceptions and overdue risks.
- [ ] Review security-event trends and rate-limit/authentication anomalies.
- [ ] Review backup success evidence.

## Quarterly
- [ ] Reassess operational risk register.
- [ ] Perform privileged-access review and evidence sign-off.
- [ ] Test backup restoration and document RPO/RTO results.
- [ ] Review vendor/provider security posture.
- [ ] Review security policies and control ownership.
- [ ] Review incident-response readiness and contact details.

## After material change or incident
- [ ] Reassess affected risks and controls.
- [ ] Update evidence and owners.
- [ ] Re-run applicable security gates.
- [ ] Update incident/post-incident actions where applicable.
