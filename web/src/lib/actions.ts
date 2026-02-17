'use server'

import { AccountingRepo, PostEntryParams } from "@core/repo";
import { Account } from "@core/types";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export async function registerUserAction(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const businessName = formData.get('businessName') as string;

    if (!email || !password || !businessName) {
        throw new Error("Missing required fields");
    }

    // 1. Create User
    const user = await AccountingRepo.createUser({
        name,
        email,
        passwordHash: password // In real app: bcrypt.hash(password, 10)
    });

    // 2. Create Tenant (automatically sets up COA)
    const tenant = await AccountingRepo.createTenant({
        name: businessName,
        ownerId: user.id
    });

    // 3. Log them in automatically (optional) or redirect to login
    // For simplicity right now, just redirect to login
    redirect('/login?registered=true');
}

export async function ensureAuth() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;
    if (!tenantId) throw new Error("Unauthorized: No active tenant found");
    return { session, tenantId };
}

// Helper to format money. We redefine 'type' as string to match DB driver output.
export type AccountSummary = Omit<Account, 'type'> & {
    type: string;
    balanceCents: number;
    formattedBalance: string;
    showOnDashboard?: boolean;
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
    const { tenantId } = await ensureAuth();
    // Override incoming tenantId with session tenantId for security
    await AccountingRepo.postJournalEntry({ ...data, tenantId });
    revalidatePath('/');
    revalidatePath('/ledger');
}

export async function createAccountAction(formData: FormData) {
    const { tenantId } = await ensureAuth();

    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const showOnDashboard = formData.get('showOnDashboard') === 'on';

    if (!code || !name || !type) return;

    await AccountingRepo.createAccount({
        tenantId,
        code,
        name,
        type,
        showOnDashboard,
        isSystem: false // User created accounts are not system
    });

    revalidatePath('/');
    revalidatePath('/accounts');
}

export async function getPLReportData(tenantId: string, startDate: string, endDate: string) {
    noStore();
    try {
        return await AccountingRepo.getPLReport(tenantId, startDate, endDate);
    } catch (err) {
        console.error("Failed to fetch P&L Report:", err);
        throw err;
    }
}

export async function getBalanceSheetData(tenantId: string, asOfDate: string) {
    noStore();
    try {
        return await AccountingRepo.getBalanceSheet(tenantId, asOfDate);
    } catch (err) {
        console.error("Failed to fetch Balance Sheet:", err);
        throw err;
    }
}

export async function archiveAccountAction(accountId: string) {
    if (!accountId) return;
    await AccountingRepo.archiveAccount(accountId);
    revalidatePath('/');
    revalidatePath('/accounts');
}

export async function getAgedReceivablesAction(tenantId: string) {
    noStore();
    try {
        return await AccountingRepo.getAgedReceivables(tenantId);
    } catch (err) {
        console.error("Failed to fetch Aged Receivables:", err);
        throw err;
    }
}

// -----------------------------------------------------------------------------
// Invoicing Actions
// -----------------------------------------------------------------------------

export async function createCustomerAction(name: string, email?: string, address?: string) {
    const { tenantId } = await ensureAuth();
    if (!name) throw new Error("Customer name is required");
    await AccountingRepo.createCustomer({
        tenantId,
        name,
        email,
        address
    });
    revalidatePath('/invoices/customers');
}

export async function getCustomersAction(tenantId: string) {
    noStore();
    return await AccountingRepo.listCustomers(tenantId);
}

// Minimal wrapper for complex object passing
export async function createInvoiceAction(customerId: string, issueDate: string, dueDate: string, lines: any[]) {
    const { tenantId } = await ensureAuth();
    // Basic validation
    if (!customerId || lines.length === 0) throw new Error("Invalid Invoice Data");

    await AccountingRepo.createInvoice({
        tenantId,
        customerId,
        issueDate,
        dueDate,
        lines: lines.map(l => ({
            description: l.description,
            quantity: Number(l.quantity),
            unitPriceCents: Math.round(Number(l.unitPrice) * 100),
            revenueAccountId: l.revenueAccountId
        }))
    });
    revalidatePath('/invoices');
}

export async function getInvoicesAction(tenantId: string) {
    noStore();
    return await AccountingRepo.listInvoices(tenantId);
}

export async function getInvoiceAction(invoiceId: string) {
    noStore();
    return await AccountingRepo.getInvoice(invoiceId);
}

export async function approveInvoiceAction(invoiceId: string) {
    if (!invoiceId) return;
    await AccountingRepo.approveInvoice(invoiceId);
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath('/'); // Updates dashboard metrics
}

export async function payInvoiceAction(invoiceId: string, formData: FormData) {
    const bankAccountId = formData.get('bankAccountId') as string;
    const date = formData.get('date') as string || new Date().toISOString().split('T')[0];

    if (!invoiceId || !bankAccountId) return;

    await AccountingRepo.payInvoice(invoiceId, bankAccountId, date);

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath('/');
}

export async function voidInvoiceAction(invoiceId: string) {
    if (!invoiceId) return;
    await AccountingRepo.voidInvoice(invoiceId);
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath('/');
}

// -----------------------------------------------------------------------------
// Expenses (AP) Actions
// -----------------------------------------------------------------------------

export async function createSupplierAction(name: string, email?: string, address?: string) {
    const { tenantId } = await ensureAuth();
    if (!name) throw new Error("Supplier name is required");
    await AccountingRepo.createSupplier({
        tenantId,
        name,
        email,
        address
    });
    revalidatePath('/bills/suppliers');
}

export async function fixDatabaseAction() {
    await AccountingRepo.fixDatabaseSchema();
    revalidatePath('/');
    // return { success: true }; // Removed return to satisfy void return type for form action
}

export async function getSuppliersAction(tenantId: string) {
    noStore();
    return await AccountingRepo.listSuppliers(tenantId);
}

export async function createBillAction(supplierId: string, issueDate: string, dueDate: string, lines: any[]) {
    const { tenantId } = await ensureAuth();
    if (!supplierId || lines.length === 0) throw new Error("Invalid Bill Data");

    await AccountingRepo.createBill({
        tenantId,
        supplierId,
        issueDate,
        dueDate,
        lines: lines.map(l => ({
            description: l.description,
            quantity: Number(l.quantity),
            unitPriceCents: Math.round(Number(l.unitPrice) * 100),
            expenseAccountId: l.expenseAccountId
        }))
    });
    revalidatePath('/bills');
}

export async function getBillsAction(tenantId: string) {
    noStore();
    return await AccountingRepo.listBills(tenantId);
}

export async function getBillAction(billId: string) {
    noStore();
    return await AccountingRepo.getBill(billId);
}

export async function approveBillAction(billId: string) {
    if (!billId) return;
    await AccountingRepo.approveBill(billId);
    revalidatePath('/bills');
    revalidatePath(`/bills/${billId}`);
    revalidatePath('/');
}

export async function payBillAction(billId: string, formData: FormData) {
    const bankAccountId = formData.get('bankAccountId') as string;
    const date = formData.get('date') as string || new Date().toISOString().split('T')[0];

    if (!billId || !bankAccountId) return;

    await AccountingRepo.payBill(billId, bankAccountId, date);

    revalidatePath('/bills');
    revalidatePath(`/bills/${billId}`);
    revalidatePath('/');
}

// -----------------------------------------------------------------------------
// Banking & Reconciliation Actions
// -----------------------------------------------------------------------------

export async function getUnreconciledTransactionsAction(tenantId: string) {
    noStore();
    try {
        const transactions = await AccountingRepo.getUnreconciled(tenantId);

        // Attach suggestions based on rules
        const withSuggestions = await Promise.all(transactions.map(async (tx) => {
            const suggestion = await AccountingRepo.findSuggestedRule(tenantId, tx.description);
            return {
                ...tx,
                suggestion: suggestion || null
            };
        }));

        return withSuggestions;
    } catch (err) {
        console.error("Failed to fetch unreconciled transactions:", err);
        return [];
    }
}

export async function importBankTransactionAction(description: string, amount: number, date: string, bankAccountId: string) {
    const { tenantId } = await ensureAuth();
    await AccountingRepo.importTransaction({
        tenantId,
        description,
        amountCents: Math.round(amount * 100),
        date,
        bankAccountId
    });
    revalidatePath('/banking/reconcile');
}

export async function reconcileTransactionAction(transactionId: string, matchedEntryId: string) {
    await AccountingRepo.reconcileTransaction(transactionId, matchedEntryId);
    revalidatePath('/banking/reconcile');
    revalidatePath('/');
}

export async function findBankAccountAction(name: string) {
    const { tenantId } = await ensureAuth();
    noStore();
    return await AccountingRepo.findBankAccount(tenantId, name);
}

export async function createBankRuleAction(name: string, pattern: string, targetAccountId: string) {
    const { tenantId } = await ensureAuth();
    await AccountingRepo.createBankRule({
        tenantId,
        name,
        pattern,
        targetAccountId
    });
    revalidatePath('/banking/reconcile');
}

export async function deleteBankRuleAction(id: string) {
    await AccountingRepo.deleteBankRule(id);
    revalidatePath('/banking/rules');
}

export async function getBankRulesAction(tenantId: string) {
    noStore();
    return await AccountingRepo.listBankRules(tenantId);
}

export async function simulateBankImportAction() {
    const { tenantId } = await ensureAuth();

    const runImport = async () => {
        const bank = await AccountingRepo.findBankAccount(tenantId, 'Bank');
        if (!bank) {
            // Create a bank account if missing
            await AccountingRepo.createAccount({
                tenantId,
                code: '100',
                name: 'Checking Bank Account',
                type: 'ASSET',
                showOnDashboard: true
            });
        }

        // Ensure we have some revenue and expense accounts for rules
        const sales = await AccountingRepo.listAccounts(tenantId).then(accs => accs.find(a => a.code === '400'));
        if (!sales) {
            await AccountingRepo.createAccount({ tenantId, code: '400', name: 'Sales', type: 'REVENUE' });
        }
        const meals = await AccountingRepo.listAccounts(tenantId).then(accs => accs.find(a => a.code === '510'));
        if (!meals) {
            await AccountingRepo.createAccount({ tenantId, code: '510', name: 'Meals & Entertainment', type: 'EXPENSE' });
        }
        const office = await AccountingRepo.listAccounts(tenantId).then(accs => accs.find(a => a.code === '500'));
        if (!office) {
            await AccountingRepo.createAccount({ tenantId, code: '500', name: 'Office Supplies', type: 'EXPENSE' });
        }

        const bankAcc = await AccountingRepo.findBankAccount(tenantId, 'Bank');
        if (!bankAcc) return;

        // Seed some Rules if they don't exist
        const rules = await AccountingRepo.listBankRules(tenantId);
        if (rules.length === 0) {
            const salesAcc = (await AccountingRepo.listAccounts(tenantId)).find(a => a.code === '400');
            const mealsAcc = (await AccountingRepo.listAccounts(tenantId)).find(a => a.code === '510');
            const officeAcc = (await AccountingRepo.listAccounts(tenantId)).find(a => a.code === '500');

            if (salesAcc) await AccountingRepo.createBankRule({ tenantId, name: 'Stripe Payouts', pattern: 'Stripe', targetAccountId: salesAcc.id });
            if (mealsAcc) await AccountingRepo.createBankRule({ tenantId, name: 'Coffee/Meals', pattern: 'Starbucks', targetAccountId: mealsAcc.id });
            if (officeAcc) await AccountingRepo.createBankRule({ tenantId, name: 'Office Supplies', pattern: 'Office', targetAccountId: officeAcc.id });
        }

        const dummyLogs = [
            { desc: 'Stripe Payout', amt: 1250.00, date: '2026-02-08' },
            { desc: 'Starbucks Coffee', amt: -6.50, date: '2026-02-09' },
            { desc: 'Office Depot', amt: -45.00, date: '2026-02-07' },
            { desc: 'Client ABC Payment', amt: 500.00, date: '2026-02-09' },
        ];

        for (const log of dummyLogs) {
            await AccountingRepo.importTransaction({
                tenantId,
                description: log.desc,
                amountCents: Math.round(log.amt * 100),
                date: log.date,
                bankAccountId: bankAcc.id
            });
        }

        // --- NEW: Seed some overdue invoices for Aged Receivables testing ---
        const customers = await AccountingRepo.listCustomers(tenantId);
        let customerId;
        if (customers.length === 0) {
            const newCust = await AccountingRepo.createCustomer({ tenantId, name: 'Global Tech Solutions' });
            customerId = newCust.id;
        } else {
            customerId = customers[0].id;
        }

        const revAcc = (await AccountingRepo.listAccounts(tenantId)).find(a => a.type === 'REVENUE');
        if (revAcc) {
            const today = new Date();
            const agingScenarios = [
                { daysAgo: 5, label: 'Standard Project', amt: 120000 },
                { daysAgo: 45, label: 'Late Service Fee', amt: 45000 },
                { daysAgo: 95, label: 'Critical Overdue Balance', amt: 89000 }
            ];

            for (const s of agingScenarios) {
                const dueDate = new Date();
                dueDate.setDate(today.getDate() - s.daysAgo);
                const issueDate = new Date();
                issueDate.setDate(dueDate.getDate() - 30);

                const inv = await AccountingRepo.createInvoice({
                    tenantId,
                    customerId,
                    issueDate: issueDate.toISOString().split('T')[0],
                    dueDate: dueDate.toISOString().split('T')[0],
                    lines: [{
                        description: s.label,
                        quantity: 1,
                        unitPriceCents: s.amt,
                        revenueAccountId: revAcc.id
                    }]
                });
                await AccountingRepo.approveInvoice(inv.id);
            }
        }
    };

    try {
        await runImport();
    } catch (err: any) {
        if (err.message?.includes('relation "bank_rules" does not exist') || err.message?.includes('relation "bank_transactions" does not exist')) {
            console.log("🛠 Schema missing. Running emergency fix...");
            await AccountingRepo.fixDatabaseSchema();
            await runImport(); // Retry
        } else {
            throw err;
        }
    }
    revalidatePath('/banking/reconcile');
    revalidatePath('/');
}

export async function matchBankTransactionAction(transactionId: string, matchType: 'INVOICE' | 'BILL', matchId: string) {
    const { tenantId } = await ensureAuth();
    const transactions = await AccountingRepo.getUnreconciled(tenantId);
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) throw new Error("Transaction not found");

    let entry;
    if (matchType === 'INVOICE') {
        entry = await AccountingRepo.payInvoice(matchId, tx.bankAccountId, tx.date);
    } else {
        entry = await AccountingRepo.payBill(matchId, tx.bankAccountId, tx.date);
    }

    if (entry) {
        await AccountingRepo.reconcileTransaction(transactionId, entry.id);
    }

    revalidatePath('/banking/reconcile');
    revalidatePath('/');
}

export async function importBankTransactionsAction(transactions: { date: string, description: string, amountCents: number }[], bankAccountId: string) {
    const { tenantId } = await ensureAuth();
    await AccountingRepo.importTransactionsBulk(tenantId, bankAccountId, transactions);
    revalidatePath('/banking/reconcile');
    revalidatePath('/');
}

export async function categorizeBankTransactionAction(transactionId: string, categoryAccountId: string) {
    const { tenantId } = await ensureAuth();
    const transactions = await AccountingRepo.getUnreconciled(tenantId);
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) throw new Error("Transaction not found");

    // Create a simple journal entry
    // If amount is positive (Deposit): Debit Bank, Credit Category
    // If amount is negative (Withdrawal): Credit Bank, Debit Category

    const lines = [
        {
            accountId: tx.bankAccountId,
            debitCents: tx.amountCents > 0 ? tx.amountCents : 0,
            creditCents: tx.amountCents < 0 ? Math.abs(tx.amountCents) : 0
        },
        {
            accountId: categoryAccountId,
            debitCents: tx.amountCents < 0 ? Math.abs(tx.amountCents) : 0,
            creditCents: tx.amountCents > 0 ? tx.amountCents : 0
        }
    ];

    const entry = await AccountingRepo.postJournalEntry({
        tenantId,
        date: tx.date,
        description: `Reconciled: ${tx.description}`,
        lines
    });

    await AccountingRepo.reconcileTransaction(transactionId, entry.id);

    revalidatePath('/banking/reconcile');
    revalidatePath('/');
}
