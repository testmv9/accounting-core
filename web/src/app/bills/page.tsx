import Link from "next/link";
import { getBillsAction } from "../../lib/actions";
import { auth } from "@/auth";

export default async function BillsPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view bills.</div>
    }

    let bills: any[] = [];
    try {
        bills = await getBillsAction(tenantId);
    } catch (e) {
        console.error(e);
    }

    const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bills & Expenses</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Monitor and settle your organizational liabilities</p>
                </div>
                <Link href="/bills/new" className="btn-premium">
                    <span>+</span> New Bill
                </Link>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-premium">
                    <thead>
                        <tr>
                            <th>Number</th>
                            <th>Supplier</th>
                            <th>Date</th>
                            <th>Due</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill) => (
                            <tr key={bill.id}>
                                <td style={{ fontWeight: '700' }}>
                                    <Link href={`/bills/${bill.id}`} style={{ color: 'var(--secondary)', textDecoration: 'none' }}>
                                        {bill.billNumber}
                                    </Link>
                                </td>
                                <td>{bill.supplier.name}</td>
                                <td style={{ color: 'var(--muted)' }}>{bill.issueDate}</td>
                                <td style={{ color: 'var(--muted)' }}>{bill.dueDate}</td>
                                <td>
                                    <span className={`badge ${bill.status === 'PAID' ? 'badge-success' :
                                            bill.status === 'APPROVED' ? 'badge-primary' : 'badge-muted'
                                        }`}>
                                        {bill.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: '800' }}>{formatMoney(bill.amountCents)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bills.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💸</div>
                        <p>No bills yet. Record your first purchase!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
