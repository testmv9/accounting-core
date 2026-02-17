import { getDashboardData, getPLReportData, getUnreconciledTransactionsAction, getAgedReceivablesAction } from "../actions";

/**
 * DETERMINISTIC SNAPSHOT UTILITY
 * 
 * Provides a factual, logic-based overview of the organization's state.
 * This is fed to the AI as "Ground Truth" to prevent hallucination of balances or status.
 */
export async function getFinancialSnapshot(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    try {
        const [accounts, pl, unreconciled, aged] = await Promise.all([
            getDashboardData(tenantId),
            getPLReportData(tenantId, startOfMonth, endOfMonth),
            getUnreconciledTransactionsAction(tenantId),
            getAgedReceivablesAction(tenantId)
        ]);

        const totalAssets = accounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + a.balanceCents, 0);
        const totalLiabilities = accounts.filter(a => a.type === 'LIABILITY').reduce((sum, a) => sum + a.balanceCents, 0);
        const totalEquity = accounts.filter(a => a.type === 'EQUITY').reduce((sum, a) => sum + a.balanceCents, 0);

        // P&L accounts contribute to Equity (Retained Earnings)
        // Assets = Liabilities + Equity
        const assetSide = totalAssets;
        const liabilitySide = totalLiabilities + totalEquity + pl.netProfit; // netProfit is current year earnings
        const discrepancy = Math.abs(assetSide - liabilitySide);

        const negativeAccounts = accounts.filter(a => a.type === 'ASSET' && a.balanceCents < 0);

        return {
            timestamp: now.toISOString(),
            status: "OK",
            kpis: {
                netProfit: pl.netProfit / 100,
                revenueYTD: pl.totalRevenue / 100,
                totalAssets: totalAssets / 100,
                totalLiabilities: totalLiabilities / 100,
                netEquity: (totalAssets - totalLiabilities) / 100
            },
            audit: {
                isBalanced: discrepancy < 1, // Balanced within 1 cent
                discrepancyCents: discrepancy,
                liquidityAlert: negativeAccounts.length > 0,
                negativeAccounts: negativeAccounts.map(a => a.name),
                unreconciledCount: unreconciled.length,
                overdueInvoices: aged.days90plus.length + aged.days61_90.length + aged.days31_60.length,
                criticalOverdue: aged.days90plus.length
            },
            context: {
                startOfMonth,
                endOfMonth,
                activeTenantId: tenantId
            }
        };
    } catch (err) {
        console.error("Snapshot generation failed:", err);
        return {
            timestamp: now.toISOString(),
            status: "ERROR",
            message: "Failed to generate ground truth snapshot."
        };
    }
}
