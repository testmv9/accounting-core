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
    const openInvoices = invoices.filter(i => i.status === 'AWAITING_PAYMENT');
    const openBills = bills.filter(b => b.status === 'APPROVED');

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>Dashboard</Link>
                        <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>/</span>
                        <span style={{ color: 'var(--foreground)', fontSize: '0.85rem', fontWeight: '600' }}>Banking</span>
                    </div>
                    <h1 className="page-title">Bank Reconciliation</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/banking/rules" className="btn-secondary-premium">
                        Manage Rules ⚙️
                    </Link>
                    <form action={simulateBankImportAction}>
                        <button className="btn-premium" type="submit">
                            Simulate Import
                        </button>
                    </form>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                <CsvUploader
                    bankAccounts={bankAccounts}
                    onImport={async (data, bankId) => {
                        'use server';
                        await importBankTransactionsAction(data, bankId);
                    }}
                />

                {transactions.length === 0 ? (
                    <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px var(--primary-glow))' }}>✨</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>All caught up!</h2>
                        <p style={{ color: 'var(--muted)' }}>Your bank statements are perfectly in sync with your ledger.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {transactions.length} Transactions to Reconcile
                            </h3>
                        </div>
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
            </div>
        </div>
    );
}
