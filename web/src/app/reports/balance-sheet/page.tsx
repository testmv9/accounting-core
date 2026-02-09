import Link from "next/link";
import { getBalanceSheetData } from "../../../lib/actions";
import { auth } from "@/auth";
import { HeaderWrapper } from "../../../components/brand";

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
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/reports/pnl" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        P&L
                    </Link>
                    <Link href="/reports/aged-receivables" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        Receivables
                    </Link>
                </div>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem' }}>
                    ← Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Balance Sheet
                    </h1>
                    <form style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>As Of:</label>
                        <input
                            type="date"
                            name="date"
                            defaultValue={asOfDate}
                            className="input"
                            style={{ padding: '0.3rem', fontSize: '0.8rem', width: 'auto' }}
                        />
                        <button className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Update</button>
                    </form>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>

                {/* Report Card */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '2rem', background: '#1e293b' }}>

                        {/* Assets Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#34d399', marginBottom: '1rem', borderBottom: '1px solid rgba(52, 211, 153, 0.2)', paddingBottom: '0.5rem' }}>Assets</h2>

                            {report.assets.map(a => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>{a.code} - {a.name}</span>
                                    <span>{formatMoney(a.balance)}</span>
                                </div>
                            ))}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 'bold', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
                                <span>Total Assets</span>
                                <span>{formatMoney(report.totalAssets)}</span>
                            </div>
                        </div>

                        {/* Liabilities Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f87171', marginBottom: '1rem', borderBottom: '1px solid rgba(248, 113, 113, 0.2)', paddingBottom: '0.5rem' }}>Liabilities</h2>

                            {report.liabilities.map(a => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>{a.code} - {a.name}</span>
                                    <span>{formatMoney(a.balance)}</span>
                                </div>
                            ))}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 'bold', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
                                <span>Total Liabilities</span>
                                <span>{formatMoney(report.totalLiabilities)}</span>
                            </div>
                        </div>

                        {/* Equity Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '1rem', borderBottom: '1px solid rgba(96, 165, 250, 0.2)', paddingBottom: '0.5rem' }}>Equity</h2>

                            {report.equity.map(a => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>{a.code} - {a.name}</span>
                                    <span>{formatMoney(a.balance)}</span>
                                </div>
                            ))}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                                <span>Retained Earnings (Net Income)</span>
                                <span>{formatMoney(report.lifetimeNetIncome)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 'bold', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
                                <span>Total Equity</span>
                                <span>{formatMoney(report.totalEquity)}</span>
                            </div>
                        </div>

                        {/* Check */}
                        <div style={{
                            marginTop: '2rem', paddingTop: '1rem', borderTop: '2px dashed #475569',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                Liabilities + Equity
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: Math.abs(report.totalAssets - (report.totalLiabilities + report.totalEquity)) < 0.01 ? '#34d399' : '#f87171' }}>
                                {formatMoney(report.totalLiabilities + report.totalEquity)}
                            </div>
                        </div>
                        {Math.abs(report.totalAssets - (report.totalLiabilities + report.totalEquity)) >= 0.01 && (
                            <div style={{ color: '#f87171', fontSize: '0.8rem', textAlign: 'right', marginTop: '0.5rem' }}>
                                ⚠️ Balance Sheet is out of balance! Check ledger integrity.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
}
