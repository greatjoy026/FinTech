# CORE-001 Incident & Escalation Matrix

| Severity | Example trigger | Immediate action | Escalation target | Evidence |
|---|---|---|---|---|
| SEV-1 Critical | Active compromise, unauthorized privileged access, major data exposure, material financial/security incident | Contain, preserve evidence, restrict affected access, assess customer impact | Incident commander + security lead + executive owner + legal/compliance as applicable | Timeline, logs, access/audit evidence, decisions |
| SEV-2 High | Repeated auth abuse, significant service security degradation, suspected provider compromise | Contain and investigate; increase monitoring | Security/Operations lead + service owner | Alerts, logs, remediation ticket |
| SEV-3 Medium | Isolated policy/control failure without material impact | Remediate and monitor | Service owner + security owner | Ticket and test evidence |
| SEV-4 Low | Minor governance/documentation/control drift | Correct during normal operations | Control owner | Change/ticket evidence |

## Regulatory and contractual escalation
For every SEV-1/SEV-2 incident, determine whether notification obligations may apply. The incident commander records the decision, jurisdiction/contract considered, decision owner, deadline if known, and whether legal/compliance review was obtained. Never infer a statutory notification deadline from this document alone.

## Incident lifecycle
1. Detect and open incident record.
2. Assign severity and incident commander.
3. Contain without destroying evidence.
4. Preserve relevant logs/audit records with minimal sensitive data.
5. Determine scope and affected systems/data.
6. Engage legal/compliance where obligations may apply.
7. Recover using the reliability/recovery runbooks.
8. Validate controls before closure.
9. Produce a post-incident review with root cause, corrective actions, owners, and due dates.
10. Feed lessons into the risk register and control framework.

## Communications
Customer, partner, regulator, law-enforcement, and public communications are made only by authorized roles. Internal technical channels must not contain credentials, raw tokens, unnecessary personal data, or unverified claims.
