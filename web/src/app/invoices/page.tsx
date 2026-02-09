import Link from "next/link";
import { getInvoicesAction } from "../../lib/actions";
import { auth } from "@/auth";
import { HeaderWrapper } from "../../components/brand";

export default async function InvoicesPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view invoices.</div>
    }

    const invoices = await getInvoicesAction(tenantId);

    const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        Dashboard
                    </Link>
                    <Link href="/invoices/new" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        + New Invoice
                    </Link>
                </div>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Invoices
                </h1>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>NUMBER</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>CUSTOMER</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>DATE</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>DUE</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>STATUS</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'right' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv, i) => (
                                <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/invoices/${inv.id}`} style={{ color: '#38bdf8', fontWeight: 'bold', textDecoration: 'none' }}>
                                            {inv.invoiceNumber}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{inv.customer.name}</td>
                                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{inv.issueDate}</td>
                                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{inv.dueDate}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                            background: inv.status === 'PAID' ? 'rgba(52, 211, 153, 0.2)' : inv.status === 'SENT' || inv.status === 'AWAITING_PAYMENT' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                            color: inv.status === 'PAID' ? '#34d399' : inv.status === 'SENT' || inv.status === 'AWAITING_PAYMENT' ? '#38bdf8' : '#cbd5e1'
                                        }}>
                                            {inv.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(inv.amountCents)}</td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        No invoices yet. Create your first one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
