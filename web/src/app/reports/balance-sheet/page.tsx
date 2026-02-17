import Link from "next/link";
import { getBalanceSheetData } from "../../../lib/actions";
import { auth } from "@/auth";

export default async function BalanceSheetPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const { date } = await searchParams;
    const asOfDate = date || new Date().toISOString().split('T')[0];
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view reports.</div>
    }

    const report = await getBalanceSheetData(tenantId, asOfDate);
    const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Balance Sheet</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Snapshot of financial position as of {asOfDate}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <form style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            type="date"
                            name="date"
                            defaultValue={asOfDate}
                            className="input-premium"
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
                        />
                        <button className="btn-secondary-premium" style={{ padding: '0.5rem 1rem' }}>Update</button>
                    </form>
                    <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.5rem' }} />
                    <Link href="/reports/pnl" className="btn-secondary-premium">P&L</Link>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2.5rem' }}>
                    {/* Assets Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--success)', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Assets</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {report.assets.map(a => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '500' }}>
                                    <span><span style={{ color: 'var(--muted)', width: '60px', display: 'inline-block' }}>{a.code}</span> {a.name}</span>
                                    <span style={{ fontWeight: '700' }}>{formatMoney(a.balance)}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontWeight: '800', borderTop: '2px solid var(--glass-border)', paddingTop: '1rem', fontSize: '1.1rem' }}>
                            <span>Total Assets</span>
                            <span style={{ color: 'var(--success)' }}>{formatMoney(report.totalAssets)}</span>
                        </div>
                    </div>

                    {/* Liabilities Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--danger)', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Liabilities</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {report.liabilities.map(a => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '500' }}>
                                    <span><span style={{ color: 'var(--muted)', width: '60px', display: 'inline-block' }}>{a.code}</span> {a.name}</span>
                                    <span style={{ fontWeight: '700' }}>{formatMoney(a.balance)}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontWeight: '800', borderTop: '2px solid var(--glass-border)', paddingTop: '1rem', fontSize: '1.1rem' }}>
                            <span>Total Liabilities</span>
                            <span style={{ color: 'var(--danger)' }}>{formatMoney(report.totalLiabilities)}</span>
                        </div>
                    </div>

                    {/* Equity Section */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Equity</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {report.equity.map(a => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '500' }}>
                                    <span><span style={{ color: 'var(--muted)', width: '60px', display: 'inline-block' }}>{a.code}</span> {a.name}</span>
                                    <span style={{ fontWeight: '700' }}>{formatMoney(a.balance)}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--muted)', fontWeight: '500' }}>
                                <span>Retained Earnings (Net Income)</span>
                                <span>{formatMoney(report.lifetimeNetIncome)}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontWeight: '800', borderTop: '2px solid var(--glass-border)', paddingTop: '1rem', fontSize: '1.1rem' }}>
                            <span>Total Equity</span>
                            <span style={{ color: 'var(--primary)' }}>{formatMoney(report.totalEquity)}</span>
                        </div>
                    </div>

                    {/* Final Balance Verification */}
                    <div style={{
                        marginTop: '1rem', padding: '2rem', borderRadius: 'var(--radius-md)',
                        background: 'var(--surface-hover)', border: '1px solid var(--glass-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: 'var(--glass-shadow)'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Liabilities + Equity</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--foreground)' }}>
                                {formatMoney(report.totalLiabilities + report.totalEquity)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Status</div>
                            <div style={{
                                fontWeight: '900',
                                fontSize: '1.25rem',
                                color: Math.abs(report.totalAssets - (report.totalLiabilities + report.totalEquity)) < 0.01 ? 'var(--success)' : 'var(--danger)',
                                background: Math.abs(report.totalAssets - (report.totalLiabilities + report.totalEquity)) < 0.01 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '8px'
                            }}>
                                {Math.abs(report.totalAssets - (report.totalLiabilities + report.totalEquity)) < 0.01 ? 'BALANCED' : 'OUT OF BALANCE'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
