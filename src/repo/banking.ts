import { db } from "../db";
import { accounts, bankTransactions, bankRules } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export type CreateBankTransactionParams = {
    tenantId: string;
    description: string;
    amountCents: number;
    date: string;
    bankAccountId: string;
};

export const BankingRepo = {
    /**
     * Import a Bank Transaction (e.g. from CSV)
     */
    async importTransaction(params: CreateBankTransactionParams) {
        // Idempotency check: in a real app, we'd check if (account + date + amount + description) already exists.
        // For MVP, we'll just insert.

        return await db.insert(bankTransactions).values({
            id: createId(),
            tenantId: params.tenantId,
            bankAccountId: params.bankAccountId,
            date: params.date,
            description: params.description,
            amountCents: params.amountCents,
            status: 'PENDING'
        }).returning();
    },

    async importTransactionsBulk(tenantId: string, bankAccountId: string, lines: { date: string, description: string, amountCents: number }[]) {
        if (lines.length === 0) return [];

        return await db.insert(bankTransactions).values(
            lines.map(l => ({
                id: createId(),
                tenantId,
                bankAccountId,
                date: l.date,
                description: l.description,
                amountCents: l.amountCents,
                status: 'PENDING'
            }))
        ).returning();
    },

    /**
     * Get All Unreconciled Transactions
     */
    async getUnreconciled(tenantId: string) {
        return await db.query.bankTransactions.findMany({
            where: (t, { eq, and }) => and(
                eq(t.tenantId, tenantId),
                eq(t.status, 'PENDING')
            ),
            orderBy: (t, { desc }) => desc(t.date)
        });
    },

    /**
     * Match a transaction to an existing journal entry (or create one)
     */
    async reconcileTransaction(transactionId: string, matchedEntryId: string) {
        await db.update(bankTransactions)
            .set({
                status: 'MATCHED',
                matchedEntryId: matchedEntryId
            })
            .where(eq(bankTransactions.id, transactionId));
    },

    /**
     * Find a Bank Account by Name (Helper for seeds/imports)
     */
    async findBankAccount(tenantId: string, nameLike: string) {
        return await db.query.accounts.findFirst({
            where: (a, { eq, and, like }) => and(eq(a.tenantId, tenantId), like(a.name, `%${nameLike}%`))
        });
    },

    /**
     * BANK RULES
     */
    async createBankRule(params: { tenantId: string, name: string, pattern: string, targetAccountId: string }) {
        return await db.insert(bankRules).values({
            id: createId(),
            ...params
        }).returning();
    },

    async listBankRules(tenantId: string) {
        return await db.query.bankRules.findMany({
            where: (r, { eq }) => eq(r.tenantId, tenantId),
            with: {
                targetAccount: true
            }
        });
    },

    async findSuggestedRule(tenantId: string, description: string) {
        const rules = await this.listBankRules(tenantId);
        // Return first rule where pattern is present in description (case insensitive)
        return rules.find(r =>
            description.toLowerCase().includes(r.pattern.toLowerCase())
        );
    },

    async deleteBankRule(id: string) {
        return await db.delete(bankRules).where(eq(bankRules.id, id));
    }
};
