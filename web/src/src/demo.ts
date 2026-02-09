import {
  seedSystemAccounts,
  indexAccountsById,
  postJournalEntry,
  getAccountLedger,
  createLedgerStore,
} from "./index";

import { formatCents } from "./money";
import type { LedgerLine } from "./types";

function printLedger(title: string, lines: LedgerLine[]) {
  console.log(`\n=== ${title} ===`);
  for (const l of lines) {
    const dr = l.debitCents ? formatCents(l.debitCents) : "";
    const cr = l.creditCents ? formatCents(l.creditCents) : "";
    console.log(
      `${l.date} | ${l.entryId} | ${l.description} | DR ${dr.padStart(8)} | CR ${cr.padStart(8)} | BAL ${formatCents(l.balanceCents)}`
    );
  }
}


const tenantId = "t1";
const accountsById = indexAccountsById(seedSystemAccounts(tenantId));

// Option A (best): use a factory
let ledger = createLedgerStore();

// Option B (if you don't have createLedgerStore yet):
// let ledger: LedgerStore = {};

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

printLedger("Bank", getAccountLedger(ledger, "bank"));

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

printLedger("Bank", getAccountLedger(ledger, "bank"));
printLedger("Expense", getAccountLedger(ledger, "expense"));


// ✅ 3) Revenue example (proves income posting)
ledger = postJournalEntry(
  {
    id: "je-3",
    tenantId,
    date: "2026-01-14",
    description: "Cash sale",
    lines: [
      { accountId: "bank", debitCents: 50_000 },
      { accountId: "revenue", creditCents: 50_000 },
    ],
  },
  ledger,
  accountsById
);

printLedger("Bank", getAccountLedger(ledger, "bank"));
printLedger("Revenue", getAccountLedger(ledger, "revenue"));

// ✅ 4) Invoice issued (AR increases, Revenue increases)
ledger = postJournalEntry(
  {
    id: "je-4",
    tenantId,
    date: "2026-01-16",
    description: "Invoice issued (on credit)",
    lines: [
      { accountId: "ar", debitCents: 80_000 },
      { accountId: "revenue", creditCents: 80_000 },
    ],
  },
  ledger,
  accountsById
);

printLedger("Accounts Receivable", getAccountLedger(ledger, "ar"));
printLedger("Revenue", getAccountLedger(ledger, "revenue"));

// ✅ 5) Invoice paid (Bank increases, AR goes back down)
ledger = postJournalEntry(
  {
    id: "je-5",
    tenantId,
    date: "2026-01-20",
    description: "Invoice paid",
    lines: [
      { accountId: "bank", debitCents: 80_000 },
      { accountId: "ar", creditCents: 80_000 },
    ],
  },
  ledger,
  accountsById
);

printLedger("Bank", getAccountLedger(ledger, "bank"));
printLedger("Accounts Receivable", getAccountLedger(ledger, "ar"));

// ✅ 6) Bill received (on credit): Expense DR, AP CR
ledger = postJournalEntry(
  {
    id: "je-6",
    tenantId,
    date: "2026-01-21",
    description: "Bill received (on credit)",
    lines: [
      { accountId: "expense", debitCents: 30_000 },
      { accountId: "ap", creditCents: 30_000 },
    ],
  },
  ledger,
  accountsById
);

printLedger("Expense", getAccountLedger(ledger, "expense"));
printLedger("Accounts Payable", getAccountLedger(ledger, "ap"));

// ✅ 7) Pay the bill: AP DR, Bank CR
ledger = postJournalEntry(
  {
    id: "je-7",
    tenantId,
    date: "2026-01-25",
    description: "Bill paid",
    lines: [
      { accountId: "ap", debitCents: 30_000 },
      { accountId: "bank", creditCents: 30_000 },
    ],
  },
  ledger,
  accountsById
);

printLedger("Bank", getAccountLedger(ledger, "bank"));
printLedger("Accounts Payable", getAccountLedger(ledger, "ap"));

import { getTrialBalance } from "./index";

console.log("\n=== Trial Balance ===");
for (const row of getTrialBalance(ledger, accountsById)) {
  console.log(
    `${row.code} ${row.name.padEnd(22)} | DR ${formatCents(row.debitCents).padStart(10)} | CR ${formatCents(row.creditCents).padStart(10)}`
  );
}







