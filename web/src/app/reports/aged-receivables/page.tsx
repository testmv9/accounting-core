import Link from "next/link";
import { getAgedReceivablesAction } from "../../../lib/actions";
import { HeaderWrapper } from "../../../components/brand";

import { auth } from "@/auth";

export default async function AgedReceivablesPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view reports.</div>
    }

    const report = await getAgedReceivablesAction(tenantId);

    const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    const buckets = [
        { label: '90+ Days', key: 'days90plus', color: '#ef4444' },
        { label: '61-90 Days', key: 'days61_90', color: '#f97316' },
        { label: '31-60 Days', key: 'days31_60', color: '#eab308' },
        { label: '1-30 Days', key: 'days1_30', color: '#3b82f6' },
        { label: 'Current', key: 'current', color: '#10b981' },
    ];

    const getBucketTotal = (key: string) => (report as any)[key].reduce((sum: number, i: any) => sum + i.amount, 0);

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <Link href="/reports/pnl" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    View P&L 📊
                </Link>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <Link href="/" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    ← Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Aged Receivables
                    </h1>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Debtors</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#38bdf8' }}>{formatMoney(report.total)}</div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 2rem' }}>

                {/* Visual Aging Bar */}
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Aging Breakdown</h3>
                    <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                        {buckets.map(b => {
                            const total = getBucketTotal(b.key);
                            const width = report.total > 0 ? (total / report.total) * 100 : 0;
                            if (width === 0) return null;
                            return (
                                <div key={b.key} style={{ width: `${width}%`, backgroundColor: b.color, transition: 'width 0.5s ease' }} title={`${b.label}: ${formatMoney(total)}`} />
                            );
                        })}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                        {buckets.map(b => (
                            <div key={b.key}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: b.color }} />
                                    {b.label}
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatMoney(getBucketTotal(b.key))}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Lists */}
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {buckets.map(b => {
                        const items = (report as any)[b.key];
                        if (items.length === 0) return null;

                        return (
                            <div key={b.key} className="card" style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ color: b.color, fontWeight: 'bold', margin: 0 }}>{b.label}</h4>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{items.length} Invoices</span>
                                </div>
                                <div style={{ padding: '0 1.5rem' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                <th style={{ padding: '1rem 0' }}>Customer</th>
                                                <th style={{ padding: '1rem 0' }}>Invoice</th>
                                                <th style={{ padding: '1rem 0' }}>Due Date</th>
                                                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item: any, idx: number) => (
                                                <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <td style={{ padding: '1rem 0', fontWeight: '500' }}>{item.customer}</td>
                                                    <td style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>{item.invoiceNumber}</td>
                                                    <td style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>{item.dueDate}</td>
                                                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(item.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                    {report.total === 0 && (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            <h2>No Outstanding Invoices</h2>
                            <p>All your customers have settled their accounts.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
