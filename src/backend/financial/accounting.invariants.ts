import { FinancialDomainError } from './financial.errors';

export type AccountingLine = {
  accountId: string;
  direction: 'DEBIT' | 'CREDIT';
  amount: bigint;
};

export function validateJournalLines(lines: AccountingLine[]) {
  if (lines.length < 2) throw new FinancialDomainError('INVALID_JOURNAL', 'A journal requires at least two lines');
  let debit = 0n;
  let credit = 0n;
  for (const line of lines) {
    if (!line.accountId || !['DEBIT', 'CREDIT'].includes(line.direction)) {
      throw new FinancialDomainError('INVALID_JOURNAL', 'Invalid journal line');
    }
    if (line.amount <= 0n) throw new FinancialDomainError('INVALID_AMOUNT', 'Financial amounts must be positive');
    if (line.direction === 'DEBIT') debit += line.amount;
    else credit += line.amount;
  }
  if (debit === 0n || debit !== credit) throw new FinancialDomainError('UNBALANCED_JOURNAL', 'Journal debits and credits must balance');
  return { debit, credit };
}

export function normalBalance(type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE', debit: bigint, credit: bigint) {
  return type === 'ASSET' || type === 'EXPENSE' ? debit - credit : credit - debit;
}
