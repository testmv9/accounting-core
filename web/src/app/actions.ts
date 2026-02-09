'use server'

import { AccountingRepo, PostEntryParams } from "@core/repo";
import { Account } from "@core/types";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

// Helper to format money. We redefine 'type' as string to match DB driver output.
export type AccountSummary = Omit<Account, 'type'> & {
    type: string;
    balanceCents: number;
    formattedBalance: string;
}

export async function getDashboardData(tenantId: string): Promise<AccountSummary[]> {
    noStore(); // Explicitly opt out of static rendering
    try {
        const accounts = await AccountingRepo.listAccounts(tenantId);

        // Fetch balances in parallel
        const summaries = await Promise.all(
            accounts.map(async (acc) => {
                const balance = await AccountingRepo.getBalance(acc.id);

                // Format: $1,234.56
                const formatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(balance / 100);

                return {
                    ...acc,
                    balanceCents: balance,
                    formattedBalance: formatted
                };
            })
        );

        // Sort by Code
        return summaries.sort((a, b) => a.code.localeCompare(b.code));
    } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        return [];
    }
}

export async function getLedgerData(tenantId: string) {
    noStore();
    try {
        // Repo now returns entries with lines AND nested accounts
        const entries = await AccountingRepo.listJournalEntries(tenantId);
        return entries;
    } catch (err) {
        console.error("Failed to fetch ledger:", err);
        return [];
    }
}

export async function postTransactionAction(data: PostEntryParams) {
    await AccountingRepo.postJournalEntry(data);
    revalidatePath('/');
    revalidatePath('/ledger');
}

export async function createAccountAction(formData: FormData) {
    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!code || !name || !type) return;

    await AccountingRepo.createAccount({
        tenantId: 'demo-tenant',
        code,
        name,
        type,
        isSystem: false // User created accounts are not system
    });

    revalidatePath('/');
    revalidatePath('/accounts');
}
