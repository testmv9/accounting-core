import Link from "next/link";
import { getDashboardData, archiveAccountAction } from "../../lib/actions";
import AccountForm from "../../components/account-form";
import { auth } from "@/auth";

export default async function AccountsPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view accounts.</div>
    }

    const accounts = await getDashboardData(tenantId);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Chart of Accounts</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Management of your organization's ledger structure</p>
                </div>
                <Link href="/" className="btn-secondary-premium">
                    Dashboard
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '2.5rem' }}>
                <AccountForm />

                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table className="table-premium">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Code</th>
                                <th>Name</th>
                                <th style={{ textAlign: 'right' }}>Balance</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((acc) => (
                                <tr key={acc.id}>
                                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: '600' }}>{acc.type}</td>
                                    <td style={{ color: 'var(--primary)', fontWeight: '800', fontFamily: 'var(--font-geist-mono)' }}>{acc.code}</td>
                                    <td style={{ fontWeight: '600' }}>{acc.name}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '800' }}>{acc.formattedBalance}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <form action={archiveAccountAction.bind(null, acc.id)}>
                                            <button className="btn-secondary-premium" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                Archive
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
