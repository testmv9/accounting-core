import Link from "next/link";
import { getInvoicesAction } from "../../lib/actions";
import { auth } from "@/auth";

export default async function InvoicesPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view invoices.</div>
    }

    const invoices = await getInvoicesAction(tenantId);
    const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Invoices</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Track and manage your customer billing</p>
                </div>
                <Link href="/invoices/new" className="btn-premium">
                    <span>+</span> New Invoice
                </Link>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-premium">
                    <thead>
                        <tr>
                            <th>Number</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Due</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id}>
                                <td style={{ fontWeight: '700' }}>
                                    <Link href={`/invoices/${inv.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                        {inv.invoiceNumber}
                                    </Link>
                                </td>
                                <td>{inv.customer.name}</td>
                                <td style={{ color: 'var(--muted)' }}>{inv.issueDate}</td>
                                <td style={{ color: 'var(--muted)' }}>{inv.dueDate}</td>
                                <td>
                                    <span className={`badge ${inv.status === 'PAID' ? 'badge-success' :
                                            inv.status === 'SENT' || inv.status === 'AWAITING_PAYMENT' ? 'badge-primary' : 'badge-muted'
                                        }`}>
                                        {inv.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: '800' }}>{formatMoney(inv.amountCents)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {invoices.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
                        <p>No invoices yet. Create your first one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
