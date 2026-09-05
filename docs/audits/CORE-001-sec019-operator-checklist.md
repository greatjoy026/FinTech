# SEC-019 Production Operator Checklist

Complete these external controls before production authorization:

- [ ] Enable GitHub branch protection or a repository ruleset on `main`.
- [ ] Require the CORE-001 Security Gate as a required status check.
- [ ] Require CODEOWNER review for protected security-sensitive paths.
- [ ] Restrict who can approve and deploy to production.
- [ ] Require MFA for human production administrators.
- [ ] Separate CI deployment, application runtime, database administration, and backup/recovery identities.
- [ ] Restrict application runtime identity from database-owner and backup-administrator privileges.
- [ ] Configure time-bound, audited break-glass access.
- [ ] Restrict cloud OIDC trust to the intended repository/environment/workflow if cloud deployment uses OIDC.
- [ ] Attach evidence of these controls to the production readiness record.

Repository evidence available from SEC-019: rulesets endpoint returned no active rulesets; branch protection could not be read through the connected integration (HTTP 403). These are therefore not claimed as active.
