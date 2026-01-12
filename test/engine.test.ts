import { describe, it, expect } from "vitest";
import {
  seedSystemAccounts,
  indexAccountsById,
  postJournalEntry,
  getAccountBalanceCents,
  type LedgerState,
} from "../src/index";

describe("double-entry core engine", () => {
  const tenantId = "t1";
  const accounts = seedSystemAccounts(tenantId);
  const accountsById = indexAccountsById(accounts);

  it("A) owner invests cash (Dr Bank / Cr Equity)", () => {
    let ledger: LedgerState = {};

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

    expect(getAccountBalanceCents(ledger, "bank")).toBe(100_000);
    expect(getAccountBalanceCents(ledger, "equity")).toBe(-100_000);
  });

  it("B) expense paid from bank (Dr Expense / Cr Bank)", () => {
    let ledger: LedgerState = {};

    ledger = postJournalEntry(
      {
        id: "je-2",
        tenantId,
        date: "2026-01-12",
        description: "Buy office supplies",
        lines: [
          { accountId: "expense", debitCents: 12_000 },
          { accountId: "bank", creditCents: 12_000 },
        ],
      },
      ledger,
      accountsById
    );

    expect(getAccountBalanceCents(ledger, "expense")).toBe(12_000);
    expect(getAccountBalanceCents(ledger, "bank")).toBe(-12_000);
  });

  it("C) raise an invoice (Dr AR / Cr Revenue)", () => {
    let ledger: LedgerState = {};

    ledger = postJournalEntry(
      {
        id: "je-3",
        tenantId,
        date: "2026-01-12",
        description: "Invoice customer",
        lines: [
          { accountId: "ar", debitCents: 50_000 },
          { accountId: "revenue", creditCents: 50_000 },
        ],
      },
      ledger,
      accountsById
    );

    expect(getAccountBalanceCents(ledger, "ar")).toBe(50_000);
    expect(getAccountBalanceCents(ledger, "revenue")).toBe(-50_000);
  });

  it("D) receive payment (Dr Bank / Cr AR)", () => {
    let ledger: LedgerState = {};

    // Start with an invoice first
    ledger = postJournalEntry(
      {
        id: "je-4a",
        tenantId,
        date: "2026-01-12",
        description: "Invoice customer",
        lines: [
          { accountId: "ar", debitCents: 50_000 },
          { accountId: "revenue", creditCents: 50_000 },
        ],
      },
      ledger,
      accountsById
    );

    // Then record the payment
    ledger = postJournalEntry(
      {
        id: "je-4b",
        tenantId,
        date: "2026-01-13",
        description: "Customer payment received",
        lines: [
          { accountId: "bank", debitCents: 50_000 },
          { accountId: "ar", creditCents: 50_000 },
        ],
      },
      ledger,
      accountsById
    );

    expect(getAccountBalanceCents(ledger, "bank")).toBe(50_000);
    expect(getAccountBalanceCents(ledger, "ar")).toBe(0);
    expect(getAccountBalanceCents(ledger, "revenue")).toBe(-50_000);
  });

  it("rejects unbalanced entries", () => {
    let ledger: LedgerState = {};

    expect(() =>
      postJournalEntry(
        {
          id: "bad-1",
          tenantId,
          date: "2026-01-12",
          description: "Broken entry",
          lines: [
            { accountId: "bank", debitCents: 10_000 },
            { accountId: "equity", creditCents: 9_999 },
          ],
        },
        ledger,
        accountsById
      )
    ).toThrow(/unbalanced/i);
  });
});
