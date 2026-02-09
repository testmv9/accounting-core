import Link from "next/link";
import { getDashboardData, archiveAccountAction } from "../../lib/actions";
import AccountForm from "../../components/account-form";
import { auth } from "@/auth";
import { HeaderWrapper } from "../../components/brand";

export default async function AccountsPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view accounts.</div>
    }

    const accounts = await getDashboardData(tenantId);

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    ← Dashboard
                </Link>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Chart of Accounts
                </h1>

                {/* Create Form */}
                <div style={{ marginBottom: '2rem' }}>
                    <AccountForm />
                </div>

                {/* Account List */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left' }}>Type</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left' }}>Code</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>Balance</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((acc, i) => (
                                <tr key={acc.id} style={{ borderBottom: i < accounts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{acc.type}</td>
                                    <td style={{ padding: '1rem', color: '#fff', fontWeight: 'bold' }}>{acc.code}</td>
                                    <td style={{ padding: '1rem' }}>{acc.name}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>{acc.formattedBalance}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <form action={archiveAccountAction.bind(null, acc.id)}>
                                            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
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
        </main>
    );
}
