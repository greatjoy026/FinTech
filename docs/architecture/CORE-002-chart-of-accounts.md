# CORE-002 — Chart of Accounts Rules

## Account classes
Every financial account belongs to exactly one normal accounting class:

| Type | Normal balance | Examples |
|---|---|---|
| ASSET | Debit | cash, provider receivable, wallet asset where applicable |
| LIABILITY | Credit | customer funds payable, fees payable |
| EQUITY | Credit | capital, retained earnings |
| REVENUE | Credit | platform fees and other earned income |
| EXPENSE | Debit | operating costs and losses |

## Account identity
- `code` is unique and stable.
- `currency` is explicit and immutable for accounting purposes.
- Account status must be `ACTIVE` before a journal can post against it.
- Parent/child hierarchy supports reporting without changing journal history.
- Account IDs, codes, and names are server-controlled configuration; clients never choose arbitrary accounting accounts for privileged financial operations.

## Multi-currency rule
A journal represents exactly one currency. FX conversion is not implicit. A future FX operation must explicitly represent both currencies and the conversion/rate policy through separate, balanced accounting entries.

## Monetary representation
All monetary values are integer minor units in `BIGINT`/TypeScript `bigint`. A currency-specific minor-unit policy must be introduced before each supported currency is activated in production; the accounting core never uses floating-point arithmetic.

## Control accounts
The production chart must identify controlled accounts for customer liabilities, provider clearing/receivables, fees, settlement, suspense, and operational cash as applicable to the licensed/business model. CORE-002 provides the primitives but does not invent provider balances or simulate external money.

## Opening balances
Opening balances must be introduced through approved, auditable opening journals with a documented source and balancing counterpart. Direct database balance updates are prohibited.
