import type { Account, LedgerState } from "./types";

export const createLedgerStore = (): LedgerState => ({});

// ✅ add this back (demo needs it)
export function getAccountLedger(ledger: LedgerState, accountId: string) {
  return ledger[accountId] ?? [];
}

export function getAccountBalanceCents(
  ledger: LedgerState,
  accountId: string
): number {
  return ledger[accountId]?.at(-1)?.balanceCents ?? 0;
}

export function getTrialBalance(
  ledger: LedgerState,
  accountsById: Record<string, Account>
): {
  accountId: string;
  code: string;
  name: string;
  debitCents: number;
  creditCents: number;
}[] {
  return Object.values(accountsById)
    .map((a) => {
      const bal = getAccountBalanceCents(ledger, a.id);
      return {
        accountId: a.id,
        code: a.code,
        name: a.name,
        debitCents: bal > 0 ? bal : 0,
        creditCents: bal < 0 ? -bal : 0,
      };
    })
    .sort((x, y) => x.code.localeCompare(y.code));
}
