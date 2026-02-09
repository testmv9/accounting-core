import { Account, JournalEntry, JournalLine } from "./types";
import { assertIntCents, sumCents } from "./money";

export function validateJournalEntry(
  entry: JournalEntry,
  accountsById: Record<string, Account>
): void {
  if (!entry.tenantId) throw new Error("JournalEntry.tenantId is required");
  if (!entry.id) throw new Error("JournalEntry.id is required");
  if (!entry.date) throw new Error("JournalEntry.date is required");
  if (!entry.description) throw new Error("JournalEntry.description is required");

  if (!Array.isArray(entry.lines) || entry.lines.length < 2) {
    throw new Error("JournalEntry.lines must have at least 2 lines");
  }

  let debitTotals: number[] = [];
  let creditTotals: number[] = [];

  entry.lines.forEach((line: JournalLine, idx: number) => {
    if (!line.accountId) throw new Error(`Line[${idx}].accountId is required`);

    const account = accountsById[line.accountId];
    if (!account) throw new Error(`Line[${idx}] references unknown accountId: ${line.accountId}`);
    if (account.tenantId !== entry.tenantId) {
      throw new Error(`Line[${idx}] account tenantId does not match entry tenantId`);
    }

    const debit = line.debitCents ?? 0;
    const credit = line.creditCents ?? 0;

    // Must be integer cents >= 0
    assertIntCents(debit, `Line[${idx}].debitCents`);
    assertIntCents(credit, `Line[${idx}].creditCents`);

    // XOR rule: exactly one side must be > 0
    const hasDebit = debit > 0;
    const hasCredit = credit > 0;
    if (hasDebit === hasCredit) {
      throw new Error(
        `Line[${idx}] must have exactly one of debitCents or creditCents > 0`
      );
    }

    debitTotals.push(debit);
    creditTotals.push(credit);
  });

  const totalDebits = sumCents(debitTotals);
  const totalCredits = sumCents(creditTotals);

  if (totalDebits !== totalCredits) {
    throw new Error(
      `JournalEntry is unbalanced: debits=${totalDebits} credits=${totalCredits}`
    );
  }
}
