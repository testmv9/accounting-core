import Link from "next/link";
import { getBillAction, approveBillAction, payBillAction, getDashboardData } from "../../../lib/actions";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { HeaderWrapper } from "../../../components/brand";

export default async function BillViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view bills.</div>
    }

    const bill = await getBillAction(id);
    if (!bill) return notFound();

    const accounts = await getDashboardData(tenantId);
    const bankAccounts = accounts.filter(a => a.type === 'ASSET');

    const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <Link href="/bills" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    ← Back
                </Link>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>

                {/* Header / Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{
                            padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold',
                            background: bill.status === 'PAID' ? 'rgba(52, 211, 153, 0.2)' : bill.status === 'APPROVED' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                            color: bill.status === 'PAID' ? '#34d399' : bill.status === 'APPROVED' ? '#ec4899' : '#cbd5e1'
                        }}>
                            {bill.status}
                        </span>

                        {bill.status === 'DRAFT' && (
                            <form action={approveBillAction.bind(null, bill.id)}>
                                <button className="btn" style={{ background: '#ec4899', color: '#fff' }}>
                                    Approve Bill
                                </button>
                            </form>
                        )}

                        {bill.status === 'APPROVED' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                                <form action={payBillAction.bind(null, bill.id)} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select name="bankAccountId" className="select" style={{ fontSize: '0.8rem', padding: '0.4rem' }} required defaultValue="">
                                        <option value="" disabled>Pay From...</option>
                                        {bankAccounts.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    <button className="btn" style={{ background: '#34d399', color: '#064e3b', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                        Record Payment
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bill Paper */}
                <div style={{ background: '#fff', color: '#0f172a', padding: '3rem', borderRadius: '4px', userSelect: 'text' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>BILL</h1>
                            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>#{bill.billNumber}</div>
                        </div>
                    </div>

                    {/* To / Details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bill From</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{bill.supplier.name}</div>
                            {bill.supplier.email && <div style={{ color: '#64748b' }}>{bill.supplier.email}</div>}
                            {bill.supplier.address && <div style={{ color: '#64748b', whiteSpace: 'pre-wrap' }}>{bill.supplier.address}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ color: '#94a3b8', marginRight: '1rem' }}>Issue Date:</span>
                                <span style={{ fontWeight: 'bold' }}>{bill.issueDate}</span>
                            </div>
                            <div>
                                <span style={{ color: '#94a3b8', marginRight: '1rem' }}>Due Date:</span>
                                <span style={{ fontWeight: 'bold' }}>{bill.dueDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Lines */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '1rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Description</th>
                                <th style={{ textAlign: 'center', padding: '1rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '1rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Unit Cost</th>
                                <th style={{ textAlign: 'right', padding: '1rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.lines.map((line) => (
                                <tr key={line.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem 0', fontWeight: '500' }}>
                                        {line.description}
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {line.expenseAccount?.code} - {line.expenseAccount?.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b' }}>{line.quantity}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', color: '#64748b' }}>{formatMoney(line.unitPriceCents)}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(line.amountCents)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                        <div style={{ width: '250px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '2px solid #0f172a', paddingTop: '1rem' }}>
                                <span>Total Due</span>
                                <span>{formatMoney(bill.amountCents)}</span>
                            </div>
                        </div>
                    </div>

                    {bill.status === 'PAID' && (
                        <div style={{
                            marginTop: '2rem', border: '2px solid #34d399', color: '#34d399',
                            textAlign: 'center', padding: '1rem', fontWeight: 'bold', fontSize: '1.5rem',
                            transform: 'rotate(-5deg)', width: '200px', margin: '2rem auto 0 auto', opacity: 0.8
                        }}>
                            PAID
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
