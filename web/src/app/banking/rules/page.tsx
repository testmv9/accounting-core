import Link from "next/link";
import { getBankRulesAction, deleteBankRuleAction } from "../../../lib/actions";
import { auth } from "@/auth";
import { HeaderWrapper } from "../../../components/brand";

export default async function BankRulesPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view bank rules.</div>
    }

    const rules = await getBankRulesAction(tenantId);

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <Link href="/banking/reconcile" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    ← Reconcile
                </Link>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Bank Rules
                </h1>

                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    {rules.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                            <h3>No rules yet</h3>
                            <p>Create rules during reconciliation to automate your bank categorization.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '1rem 1.5rem' }}>Rule Name</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>Pattern</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>Target Account</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map((rule) => (
                                    <tr key={rule.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>{rule.name}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <code style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                                                {rule.pattern}
                                            </code>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#94a3b8' }}>{rule.targetAccount.name}</td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <form action={async () => {
                                                'use server';
                                                await deleteBankRuleAction(rule.id);
                                            }}>
                                                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#f87171', border: 'none' }}>
                                                    Delete
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
}
