import Link from "next/link";
import {
    getUnreconciledTransactionsAction,
    getInvoicesAction,
    getBillsAction,
    simulateBankImportAction,
    importBankTransactionsAction,
    getDashboardData
} from "../../../lib/actions";
import ReconcileRow from "./reconcile-row";
import CsvUploader from "./csv-uploader";
import { HeaderWrapper } from "../../../components/brand";

import { auth } from "@/auth";

export default async function ReconcilePage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to reconcile.</div>
    }

    const [transactions, accounts, invoices, bills] = await Promise.all([
        getUnreconciledTransactionsAction(tenantId),
        getDashboardData(tenantId),
        getInvoicesAction(tenantId),
        getBillsAction(tenantId)
    ]);

    const bankAccounts = accounts.filter(a => a.type === 'ASSET' && (a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('cash')));

    // Filter to only approved/awaiting payment
    const openInvoices = invoices.filter(i => i.status === 'AWAITING_PAYMENT');
    const openBills = bills.filter(b => b.status === 'APPROVED');

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/banking/rules" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        Manage Rules ⚙️
                    </Link>
                    <form action={simulateBankImportAction}>
                        <button className="btn btn-secondary" type="submit" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                            Simulate Import
                        </button>
                    </form>
                </div>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>
                    ← Dashboard
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', marginBottom: '2rem' }}>Bank Reconciliation</h1>
            </div>

            <CsvUploader
                bankAccounts={bankAccounts}
                onImport={async (data, bankId) => {
                    'use server';
                    await importBankTransactionsAction(data, bankId);
                }}
            />

            {transactions.length === 0 ? (
                <div className="card" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h2>All caught up!</h2>
                    <p>No new transactions to reconcile.</p>
                </div>
            ) : (
                <div style={{ display: 'grid' }}>
                    {transactions.map((tx) => (
                        <ReconcileRow
                            key={tx.id}
                            tx={tx}
                            openInvoices={openInvoices}
                            openBills={openBills}
                            accounts={accounts}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}
