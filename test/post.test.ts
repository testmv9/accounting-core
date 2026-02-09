import { describe, it, expect } from "vitest";

import {
    seedSystemAccounts,
    indexAccountsById,
    postJournalEntry,
    createLedgerStore,
    getAccountLedger,
    getAccountBalanceCents
} from "../src/index";

describe("Accounting Core: Safe Posting", () => {
    const tenantId = "test-tenant";
    const accounts = seedSystemAccounts(tenantId);
    const accountsById = indexAccountsById(accounts);

    it("should process normal chronological entries correctly", () => {
        let ledger = createLedgerStore();

        // 1. Initial Investment (Jan 1)
        ledger = postJournalEntry({
            id: "je-1",
            tenantId,
            date: "2024-01-01",
            description: "Owner Cash",
            lines: [
                { accountId: "bank", debitCents: 1000 },
                { accountId: "equity", creditCents: 1000 }
            ]
        }, ledger, accountsById);

        // 2. Spend Money (Jan 5)
        ledger = postJournalEntry({
            id: "je-2",
            tenantId,
            date: "2024-01-05",
            description: "Buy Supplies",
            lines: [
                { accountId: "expense", debitCents: 200 },
                { accountId: "bank", creditCents: 200 }
            ]
        }, ledger, accountsById);

        // Assert balances
        expect(getAccountBalanceCents(ledger, "bank")).toBe(800); // 1000 - 200
        expect(getAccountBalanceCents(ledger, "expense")).toBe(200); // +200
    });

    it("should prevent duplicate Entry IDs (Idempotency)", () => {
        let ledger = createLedgerStore();

        const entry = {
            id: "je-100",
            tenantId,
            date: "2024-01-01",
            description: "Test Entry",
            lines: [
                { accountId: "bank", debitCents: 100 },
                { accountId: "revenue", creditCents: 100 }
            ]
        };

        // First post: Success
        ledger = postJournalEntry(entry, ledger, accountsById);

        // Second post: Update the description to prove we aren't just ignoring it
        const duplicateEntry = { ...entry, description: "Sneaky Duplicate" };

        // Should throw Error
        expect(() => {
            postJournalEntry(duplicateEntry, ledger, accountsById);
        }).toThrow(/already exists/);
    });

    it("should recalculate balances when backdating (Inserting into past)", () => {
        let ledger = createLedgerStore();

        // 1. Initial Balance (Jan 1) -> +1000 Bank
        ledger = postJournalEntry({
            id: "je-1",
            tenantId,
            date: "2024-01-01",
            description: "Start",
            lines: [
                { accountId: "bank", debitCents: 1000 },
                { accountId: "equity", creditCents: 1000 }
            ]
        }, ledger, accountsById);

        // 2. Future Transaction (Jan 10) -> -200 Bank
        // Balance should be: 1000 - 200 = 800
        ledger = postJournalEntry({
            id: "je-3",
            tenantId,
            date: "2024-01-10",
            description: "Future Expense",
            lines: [
                { accountId: "expense", debitCents: 200 },
                { accountId: "bank", creditCents: 200 }
            ]
        }, ledger, accountsById);

        expect(getAccountBalanceCents(ledger, "bank")).toBe(800);

        // 3. BACKDATED Transaction (Jan 5) -> -100 Bank
        // We forgot an expense in the middle!
        ledger = postJournalEntry({
            id: "je-2", // ID implies sequence, but date is what matters
            tenantId,
            date: "2024-01-05", // Middle Date
            description: "Forgot this one",
            lines: [
                { accountId: "expense", debitCents: 100 },
                { accountId: "bank", creditCents: 100 }
            ]
        }, ledger, accountsById);

        // --- VERIFICATION ---
        const bankLedger = getAccountLedger(ledger, "bank");

        // Ensure strictly sorted by date
        expect(bankLedger[0].date).toBe("2024-01-01");
        expect(bankLedger[1].date).toBe("2024-01-05"); // The inserted one
        expect(bankLedger[2].date).toBe("2024-01-10"); // The future one

        // Ensure Balances are correct
        // Line 1: 1000
        expect(bankLedger[0].balanceCents).toBe(1000);

        // Line 2 (Jan 5): 1000 - 100 = 900
        expect(bankLedger[1].balanceCents).toBe(900);

        // Line 3 (Jan 10): 900 - 200 = 700 
        // (CRITICAL CHECH: This was 800 before. It MUST update to 700)
        expect(bankLedger[2].balanceCents).toBe(700);

        // Final sanity check
        expect(getAccountBalanceCents(ledger, 'bank')).toBe(700);
    });

    it("should handle same-day ordering (optional/implementation detail)", () => {
        let ledger = createLedgerStore();

        // Post 3 items on same day. Should maintain insertion order?
        ledger = postJournalEntry({ id: "1", tenantId, date: "2024-01-01", description: "A", lines: [{ accountId: "bank", debitCents: 100 }, { accountId: "equity", creditCents: 100 }] }, ledger, accountsById);
        ledger = postJournalEntry({ id: "2", tenantId, date: "2024-01-01", description: "B", lines: [{ accountId: "bank", debitCents: 100 }, { accountId: "equity", creditCents: 100 }] }, ledger, accountsById);

        const bankLedger = getAccountLedger(ledger, "bank");
        expect(bankLedger[0].entryId).toBe("1"); // A
        expect(bankLedger[1].entryId).toBe("2"); // B
        expect(bankLedger[1].balanceCents).toBe(200);
    });
});
