import { Account, JournalEntry, LedgerLine, LedgerState } from "./types";
import { validateJournalEntry } from "./validate";

export function postJournalEntry(
  entry: JournalEntry,
  ledger: LedgerState,
  accountsById: Record<string, Account>
): LedgerState {
  validateJournalEntry(entry, accountsById);

  // Create a shallow copy so we don't mutate the passed-in object
  const next: LedgerState = { ...ledger };

  for (const line of entry.lines) {
    const debitCents = line.debitCents ?? 0;
    const creditCents = line.creditCents ?? 0;

    const existingLines = next[line.accountId] ?? [];
    const prevBalance = existingLines.at(-1)?.balanceCents ?? 0;

    // Universal rule: balance += debit - credit
    const newBalance = prevBalance + debitCents - creditCents;

    const ledgerLine: LedgerLine = {
      entryId: entry.id,
      date: entry.date,
      description: entry.description,
      debitCents,
      creditCents,
      balanceCents: newBalance,
    };

    next[line.accountId] = [...existingLines, ledgerLine];
  }

  return next;
}
