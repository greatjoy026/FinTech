# SEC-019 GitHub / IAM Evidence

Verified 2026-09-05.

## Repository facts

- Repository is public and the connected GitHub integration reports administrative repository permission.
- No active GitHub repository rulesets were returned by the rulesets endpoint.
- Branch protection could not be read through the connected integration; GitHub returned HTTP 403 for the branch-protection endpoint.
- Therefore branch protection, required CODEOWNER review, and required status checks are not claimed as enabled.

## Repository-enforced controls

- `.github/CODEOWNERS` covers security-sensitive source and deployment paths.
- GitHub Actions declares `contents: read` as its workflow permission boundary.
- CORE-001 security checks are mandatory in the workflow definition.
- Application privileged operations use a dedicated server-side permission and explicit allow-list.

## External IAM controls required before production

The following must be configured and evidenced in the actual hosting/GitHub environment:

- MFA for human production administrators.
- Separate production/non-production identities.
- Least-privilege CI deployment identity.
- Application runtime identity without database-owner or backup-administrator privileges.
- Separate database administration identity.
- Separate backup/recovery administration identity.
- Time-bound, audited break-glass identity.
- Protected production deployment environment with approval requirements.
- Branch protection or repository ruleset requiring the CORE-001 Security Gate and CODEOWNER review.
- OIDC/cloud trust restricted to the intended repository, environment, and workflow claims when cloud deployment is introduced.

These controls cannot be truthfully marked active from source-control evidence alone. The release/go-live checklist must attach the provider-specific evidence before production authorization.
