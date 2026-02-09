import { Account, JournalEntry, LedgerLine, LedgerState } from "./types";
import { validateJournalEntry } from "./validate";

export function postJournalEntry(
  entry: JournalEntry,
  ledger: LedgerState,
  accountsById: Record<string, Account>
): LedgerState {
  // 1. Idempotency Check: Ensure entry.id doesn't already exist
  for (const accountId in ledger) {
    const lines = ledger[accountId];
    if (lines.some((l) => l.entryId === entry.id)) {
      throw new Error(`JournalEntry with id '${entry.id}' already exists.`);
    }
  }

  // 2. Validate the entry (accounting rules)
  validateJournalEntry(entry, accountsById);

  // 3. Create a shallow copy of the state
  const next: LedgerState = { ...ledger };

  for (const line of entry.lines) {
    const debitCents = line.debitCents ?? 0;
    const creditCents = line.creditCents ?? 0;

    // Get existing lines for this account (or empty array)
    const existingLines = next[line.accountId] ?? [];

    // Construct the new line (balance will be calculated momentarily)
    const newLine: LedgerLine = {
      entryId: entry.id,
      date: entry.date,
      description: entry.description,
      debitCents,
      creditCents,
      balanceCents: 0, // placeholder
      sourceType: entry.sourceType,
      sourceId: entry.sourceId,
    };

    // 4. Insert and Sort (Handle Backdating)
    // We combine existing lines + new line, then sort by date.
    // If dates are equal, we preserve relative order of existing lines, 
    // and place the new line at the end of that date block (via stable sort or explicit handling).
    // For simplicity here, we rely on JS sort stability if the engine provides it, 
    // but to be safer/deterministic without timestamps, we can just sort by date string.
    
    const allLines = [...existingLines, newLine];
    
    allLines.sort((a, b) => {
      // Primary sort: Date
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0; // Maintain insertion order for same-day
    });

    // 5. Recalculate Balances (The "Chain Validity" Step)
    // Since we may have inserted in the middle, we must re-walk the chain 
    // to ensure every subsequent balance is correct.
    let runningBalance = 0;
    
    // Optimization: We could find the index of insertion and only re-calc from there,
    // but for <10k lines, re-walking the whole array is negligible and safer.
    const recomputedLines = allLines.map((l) => {
      runningBalance += l.debitCents - l.creditCents;
      return { ...l, balanceCents: runningBalance };
    });

    next[line.accountId] = recomputedLines;
  }

  return next;
}
