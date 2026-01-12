import { seedSystemAccounts, indexAccountsById, postJournalEntry, getAccountLedger } from "./index";

const tenantId = "t1";
const accountsById = indexAccountsById(seedSystemAccounts(tenantId));

let ledger = {};

ledger = postJournalEntry(
  {
    id: "je-1",
    tenantId,
    date: "2026-01-12",
    description: "Owner investment",
    lines: [
      { accountId: "bank", debitCents: 100_000 },
      { accountId: "equity", creditCents: 100_000 },
    ],
  },
  ledger,
  accountsById
);

console.log("Bank ledger:", getAccountLedger(ledger, "bank"));

ledger = postJournalEntry(
  {
    id: "je-2",
    tenantId,
    date: "2026-01-13",
    description: "Buy office supplies",
    lines: [
      { accountId: "expense", debitCents: 12_000 },
      { accountId: "bank", creditCents: 12_000 },
    ],
  },
  ledger,
  accountsById
);

console.log("Bank ledger:", getAccountLedger(ledger, "bank"));
console.log("Expense ledger:", getAccountLedger(ledger, "expense"));

