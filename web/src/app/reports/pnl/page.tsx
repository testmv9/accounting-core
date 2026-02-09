import Link from "next/link";
import { getPLReportData } from "../../../lib/actions";

import { auth } from "@/auth";
import { HeaderWrapper } from "../../../components/brand";

export default async function PLReportPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view reports.</div>
    }

    // For now, let's just show the current year's data
    const start = '2026-01-01';
    const end = '2026-12-31';

    const report = await getPLReportData(tenantId, start, end);

    const format = (cents: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(cents / 100);

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/reports/balance-sheet" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        Balance Sheet
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
                        Profit & Loss
                    </h1>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{start} to {end}</p>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>

                <div className="card" style={{ padding: '2rem' }}>

                    {/* REVENUE SECTION */}
                    <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        Revenue
                    </h3>
                    {report.revenue.map(r => (
                        <div key={r.accountId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1rem' }}>
                            <span>{r.name}</span>
                            <span>{format(r.amount)}</span>
                        </div>
                    ))}
                    {report.revenue.length === 0 && <p style={{ color: '#475569', fontStyle: 'italic' }}>No revenue recorded in this period.</p>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
                        <span>Total Revenue</span>
                        <span>{format(report.totalRevenue)}</span>
                    </div>

                    <div style={{ height: '3rem' }}></div>

                    {/* EXPENSES SECTION */}
                    <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        Operating Expenses
                    </h3>
                    {report.expenses.map(e => (
                        <div key={e.accountId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1rem' }}>
                            <span>{e.name}</span>
                            <span>{format(e.amount)}</span>
                        </div>
                    ))}
                    {report.expenses.length === 0 && <p style={{ color: '#475569', fontStyle: 'italic' }}>No expenses recorded in this period.</p>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
                        <span>Total Expenses</span>
                        <span>{format(report.totalExpenses)}</span>
                    </div>

                    <div style={{ margin: '3rem 0', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)' }}></div>

                    {/* NET PROFIT SECTION */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        background: report.netProfit >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid',
                        borderColor: report.netProfit >= 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                    }}>
                        <span>Net Profit</span>
                        <span style={{ color: report.netProfit >= 0 ? '#34d399' : '#f87171' }}>
                            {format(report.netProfit)}
                        </span>
                    </div>

                </div>

                <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '2rem' }}>
                    Report generated by Navera Financial Core • All figures in USD
                </p>
            </div>
        </main>
    );
}
