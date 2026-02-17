import Link from "next/link";
import { getPLReportData } from "../../../lib/actions";
import { auth } from "@/auth";

export default async function PLReportPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view reports.</div>
    }

    const start = '2026-01-01';
    const end = '2026-12-31';
    const report = await getPLReportData(tenantId, start, end);
    const format = (cents: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(cents / 100);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Profit & Loss</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Operating performance for the period {start} to {end}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/reports/balance-sheet" className="btn-secondary-premium">Balance Sheet</Link>
                    <Link href="/reports/aged-receivables" className="btn-secondary-premium">Receivables</Link>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2.5rem' }}>
                    {/* REVENUE SECTION */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                            Revenue
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {report.revenue.map(r => (
                                <div key={r.accountId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '500' }}>
                                    <span>{r.name}</span>
                                    <span style={{ fontWeight: '700' }}>{format(r.amount)}</span>
                                </div>
                            ))}
                            {report.revenue.length === 0 && <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No revenue recorded.</p>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid var(--glass-border)', fontWeight: '800', fontSize: '1.1rem' }}>
                            <span>Total Revenue</span>
                            <span style={{ color: 'var(--primary)' }}>{format(report.totalRevenue)}</span>
                        </div>
                    </div>

                    {/* EXPENSES SECTION */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h3 style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                            Operating Expenses
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {report.expenses.map(e => (
                                <div key={e.accountId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                    <span style={{ color: 'var(--muted)' }}>{e.name}</span>
                                    <span style={{ fontWeight: '600' }}>{format(e.amount)}</span>
                                </div>
                            ))}
                            {report.expenses.length === 0 && <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No expenses recorded.</p>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid var(--glass-border)', fontWeight: '800', fontSize: '1.1rem' }}>
                            <span>Total Expenses</span>
                            <span>{format(report.totalExpenses)}</span>
                        </div>
                    </div>

                    {/* NET PROFIT SECTION */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '2rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--glass-shadow)'
                    }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>Net Profit</span>
                        <span style={{
                            fontSize: '2rem',
                            fontWeight: '900',
                            color: report.netProfit >= 0 ? 'var(--success)' : 'var(--danger)',
                            filter: report.netProfit >= 0 ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.2))' : 'none'
                        }}>
                            {format(report.netProfit)}
                        </span>
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', marginTop: '3rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Generated by Navera Core Intelligence • {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
