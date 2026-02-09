import Link from "next/link";
import { getBillsAction, fixDatabaseAction } from "../../lib/actions";
import { auth } from "@/auth";
import { HeaderWrapper } from "../../components/brand";

export default async function BillsPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view bills.</div>
    }

    let bills: any[] = [];
    let error = null;

    try {
        bills = await getBillsAction(tenantId);
    } catch (e: any) {
        console.error(e);
        error = e instanceof Error ? e.message : String(e);
    }

    if (error && error.includes('relation "bills" does not exist')) {
        return (
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Database Update Required</h2>
                <p style={{ color: '#ec4899', marginBottom: '2rem' }}>We need to create the new "Bills" tables in your database.</p>
                <form action={fixDatabaseAction}>
                    <button className="btn" style={{ background: '#ec4899' }}>Run Database Update</button>
                </form>
            </main>
        );
    }

    const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        Dashboard
                    </Link>
                    <Link href="/bills/new" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        + New Bill
                    </Link>
                </div>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Bills & Expenses
                </h1>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>NUMBER</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>SUPPLIER</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>DATE</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>DUE</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>STATUS</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'right' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, i) => (
                                <tr key={bill.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/bills/${bill.id}`} style={{ color: '#ec4899', fontWeight: 'bold', textDecoration: 'none' }}>
                                            {bill.billNumber}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{bill.supplier.name}</td>
                                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{bill.issueDate}</td>
                                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{bill.dueDate}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                            background: bill.status === 'PAID' ? 'rgba(52, 211, 153, 0.2)' : bill.status === 'APPROVED' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                            color: bill.status === 'PAID' ? '#34d399' : bill.status === 'APPROVED' ? '#ec4899' : '#cbd5e1'
                                        }}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(bill.amountCents)}</td>
                                </tr>
                            ))}
                            {bills.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        No bills yet. Record a purchase!
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
