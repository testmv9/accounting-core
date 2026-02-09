import { db } from "../db";
import { accounts, journalEntries, ledgerLines } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export type CreateAccountParams = {
    tenantId: string;
    code: string;
    name: string;
    type: string;
    showOnDashboard?: boolean;
    isSystem?: boolean;
};

export type PostEntryParams = {
    tenantId: string;
    date: string; // YYYY-MM-DD
    description: string;
    lines: {
        accountId: string;
        debitCents: number;
        creditCents: number;
    }[];
};

export const LedgerRepo = {
    /**
     * Create a new Account
     */
    async createAccount(params: CreateAccountParams) {
        const [account] = await db.insert(accounts).values({
            id: createId(),
            tenantId: params.tenantId,
            code: params.code,
            name: params.name,
            type: params.type,
            showOnDashboard: params.showOnDashboard ?? false,
            isSystem: params.isSystem ?? false,
            isArchived: false
        }).returning();
        return account;
    },

    /**
     * Get all active accounts for a tenant
     */
    async listAccounts(tenantId: string, includeArchived = false) {
        if (includeArchived) {
            return db.select().from(accounts).where(eq(accounts.tenantId, tenantId));
        }
        return db.select().from(accounts).where(
            and(
                eq(accounts.tenantId, tenantId),
                eq(accounts.isArchived, false)
            )
        );
    },

    /**
     * Soft Delete (Archive) an Account
     */
    async archiveAccount(accountId: string) {
        await db.update(accounts)
            .set({ isArchived: true })
            .where(eq(accounts.id, accountId));
    },

    /**
     * Post a Journal Entry TRANSACTIONALLY
     */
    async postJournalEntry(params: PostEntryParams) {
        return await db.transaction(async (tx) => {
            // 1. Create the Entry Header
            const entryId = createId();
            const [entry] = await tx.insert(journalEntries).values({
                id: entryId,
                tenantId: params.tenantId,
                date: params.date,
                description: params.description,
            }).returning();

            // 2. Process Lines & Update Balances
            for (const line of params.lines) {
                const lastLine = await tx.query.ledgerLines.findFirst({
                    where: (model, { eq, and }) => and(eq(model.accountId, line.accountId)),
                    orderBy: (model, { desc }) => desc(model.createdAt), // Simplest: order by insertion time
                });

                const prevBalance = lastLine?.balanceCents ?? 0;
                const newBalance = prevBalance + line.debitCents - line.creditCents;

                await tx.insert(ledgerLines).values({
                    id: createId(),
                    entryId: entryId,
                    accountId: line.accountId,
                    date: params.date,
                    description: params.description,
                    debitCents: line.debitCents,
                    creditCents: line.creditCents,
                    balanceCents: newBalance
                });
            }

            return entry;
        });
    },

    /**
     * Get the current balance of an account
     */
    async getBalance(accountId: string): Promise<number> {
        const lastLine = await db.query.ledgerLines.findFirst({
            where: (lines, { eq }) => eq(lines.accountId, accountId),
            orderBy: (lines, { desc }) => desc(lines.createdAt),
        });
        return lastLine?.balanceCents ?? 0;
    },

    /**
     * List all journal entries with their lines
     */
    async listJournalEntries(tenantId: string) {
        return await db.query.journalEntries.findMany({
            where: (entries, { eq }) => eq(entries.tenantId, tenantId),
            with: {
                lines: {
                    with: {
                        account: true
                    }
                }
            },
            orderBy: (entries, { desc }) => desc(entries.date)
        });
    }
};
