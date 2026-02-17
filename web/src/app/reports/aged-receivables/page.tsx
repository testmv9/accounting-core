import Link from "next/link";
import { getAgedReceivablesAction } from "../../../lib/actions";
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
        { label: '90+ Days', key: 'days90plus', color: 'var(--danger)' },
        { label: '61-90 Days', key: 'days61_90', color: 'var(--warning)' },
        { label: '31-60 Days', key: 'days31_60', color: '#fcd34d' },
        { label: '1-30 Days', key: 'days1_30', color: 'var(--primary)' },
        { label: 'Current', key: 'current', color: 'var(--success)' },
    ];

    const getBucketTotal = (key: string) => (report as any)[key].reduce((sum: number, i: any) => sum + i.amount, 0);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Aged Receivables</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Detailed aging analysis of outstanding customer invoices</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Outstanding</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>{formatMoney(report.total)}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2.5rem' }}>
                {/* Visual Aging Bar */}
                <div className="card">
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.5rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>Aging Breakdown</h3>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--surface-hover)', marginBottom: '2rem' }}>
                        {buckets.map(b => {
                            const total = getBucketTotal(b.key);
                            const width = report.total > 0 ? (total / report.total) * 100 : 0;
                            if (width === 0) return null;
                            return (
                                <div key={b.key} style={{ width: `${width}%`, backgroundColor: b.color, transition: 'width 0.8s ease' }} title={`${b.label}: ${formatMoney(total)}`} />
                            );
                        })}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
                        {buckets.map(b => (
                            <div key={b.key} style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: '700' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: b.color }} />
                                    {b.label}
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>{formatMoney(getBucketTotal(b.key))}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Lists */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {buckets.map(b => {
                        const items = (report as any)[b.key];
                        if (items.length === 0) return null;

                        return (
                            <div key={b.key} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '1.25rem 1.75rem', background: 'var(--surface-hover)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ color: b.color, fontWeight: '800', margin: 0, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{b.label}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>{items.length} Pending Invoices</span>
                                </div>
                                <table className="table-premium">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Invoice</th>
                                            <th>Due Date</th>
                                            <th style={{ textAlign: 'right' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: '700' }}>{item.customer}</td>
                                                <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{item.invoiceNumber}</td>
                                                <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{item.dueDate}</td>
                                                <td style={{ textAlign: 'right', fontWeight: '800' }}>{formatMoney(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}

                    {report.total === 0 && (
                        <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🤝</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>All Clear!</h2>
                            <p style={{ color: 'var(--muted)' }}>No outstanding customer debt detected in the system.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
