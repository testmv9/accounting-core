import { db } from "../db";
import { accounts, ledgerLines } from "../db/schema";
import { eq, sql, and } from "drizzle-orm";
import { LedgerRepo } from "./ledgers";

export const ReportRepo = {
    /**
     * Profit & Loss Report Engine
     */
    async getPLReport(tenantId: string, startDate: string, endDate: string) {
        // Query all movements in the period
        const results = await db
            .select({
                accountId: accounts.id,
                name: accounts.name,
                code: accounts.code,
                type: accounts.type,
                netMovement: sql<number>`CAST(SUM(${ledgerLines.debitCents} - ${ledgerLines.creditCents}) AS INTEGER)`,
            })
            .from(accounts)
            .innerJoin(ledgerLines, eq(accounts.id, ledgerLines.accountId))
            .where(
                and(
                    eq(accounts.tenantId, tenantId),
                    sql`${ledgerLines.date} >= ${startDate}`,
                    sql`${ledgerLines.date} <= ${endDate}`
                )
            )
            .groupBy(accounts.id)
            .orderBy(accounts.code);

        // Separate into Revenue and Expenses
        const revenue = results.filter(r => r.type === 'REVENUE');
        const expenses = results.filter(r => r.type === 'EXPENSE');

        const totalRevenue = revenue.reduce((sum, r) => sum + (r.netMovement * -1), 0);
        const totalExpenses = expenses.reduce((sum, r) => sum + r.netMovement, 0);

        return {
            revenue: revenue.map(r => ({ ...r, amount: r.netMovement * -1 })),
            expenses: expenses.map(e => ({ ...e, amount: e.netMovement })),
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses
        };
    },

    /**
     * Balance Sheet Report Engine
     */
    async getBalanceSheet(tenantId: string, asOfDate: string) {
        // 1. Get List of all accounts
        const allAccounts = await LedgerRepo.listAccounts(tenantId);

        // 2. Calculate Balance for each account as of date
        const balances = await Promise.all(allAccounts.map(async (acc) => {
            const lastLine = await db.query.ledgerLines.findFirst({
                where: (lines, { eq, and, lte }) => and(
                    eq(lines.accountId, acc.id),
                    lte(lines.date, asOfDate)
                ),
                orderBy: (lines, { desc }) => desc(lines.createdAt), // Get last transaction on/before date
            });
            return {
                ...acc,
                balance: lastLine?.balanceCents ?? 0
            };
        }));

        // 3. Group by Type
        const assets = balances.filter(a => a.type === 'ASSET');
        const liabilities = balances.filter(a => a.type === 'LIABILITY');
        const equity = balances.filter(a => a.type === 'EQUITY');
        const revenue = balances.filter(a => a.type === 'REVENUE');
        const expenses = balances.filter(a => a.type === 'EXPENSE');

        // 4. Calculate Totals (keeping sign convention)
        const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
        const totalEquityStated = equity.reduce((sum, a) => sum + a.balance, 0);

        // Calculate Net Income (Retained Earnings) for the period (Lifetime up to asOfDate)
        const lifetimeNetIncome = -(revenue.reduce((sum, a) => sum + a.balance, 0) + expenses.reduce((sum, a) => sum + a.balance, 0));

        return {
            date: asOfDate,
            assets: assets.filter(a => a.balance !== 0),
            liabilities: liabilities.filter(a => a.balance !== 0).map(a => ({ ...a, balance: a.balance * -1 })), // Flip for display
            equity: equity.filter(a => a.balance !== 0).map(a => ({ ...a, balance: a.balance * -1 })), // Flip for display
            totalAssets,
            totalLiabilities: totalLiabilities * -1,
            totalEquityStated: totalEquityStated * -1,
            lifetimeNetIncome,
            totalEquity: (totalEquityStated * -1) + lifetimeNetIncome
        };
    },

    /**
     * Aged Receivables Report
     */
    async getAgedReceivables(tenantId: string) {
        // 1. Get all invoices that are not paid
        const unpaidInvoices = await db.query.invoices.findMany({
            where: (inv, { eq, or }) => and(
                eq(inv.tenantId, tenantId),
                eq(inv.status, 'AWAITING_PAYMENT')
            ),
            with: {
                customer: true
            }
        });

        const today = new Date();
        const report = {
            current: [] as any[],
            days1_30: [] as any[],
            days31_60: [] as any[],
            days61_90: [] as any[],
            days90plus: [] as any[],
            total: 0
        };

        for (const inv of unpaidInvoices) {
            const dueDate = new Date(inv.dueDate);
            const diffTime = today.getTime() - dueDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const item = {
                invoiceNumber: inv.invoiceNumber,
                customer: inv.customer.name,
                dueDate: inv.dueDate,
                amount: inv.amountCents,
                daysOverdue: diffDays
            };

            report.total += inv.amountCents;

            if (diffDays <= 0) {
                report.current.push(item);
            } else if (diffDays <= 30) {
                report.days1_30.push(item);
            } else if (diffDays <= 60) {
                report.days31_60.push(item);
            } else if (diffDays <= 90) {
                report.days61_90.push(item);
            } else {
                report.days90plus.push(item);
            }
        }

        return report;
    }
};
