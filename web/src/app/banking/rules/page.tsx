import Link from "next/link";
import { getBankRulesAction, deleteBankRuleAction } from "../../../lib/actions";
import { auth } from "@/auth";

export default async function BankRulesPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view bank rules.</div>
    }

    const rules = await getBankRulesAction(tenantId);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bank Rules</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Automated categorization logic for your banking statements</p>
                </div>
                <Link href="/banking/reconcile" className="btn-secondary-premium">
                    ← Back to Reconcile
                </Link>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {rules.length === 0 ? (
                    <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', opacity: 0.5 }}>🤖</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--foreground)', marginBottom: '0.5rem' }}>No rules yet</h2>
                        <p style={{ color: 'var(--muted)' }}>Create rules during reconciliation to automate your bank categorization.</p>
                    </div>
                ) : (
                    <table className="table-premium">
                        <thead>
                            <tr>
                                <th>Rule Name</th>
                                <th>Pattern</th>
                                <th>Target Account</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((rule) => (
                                <tr key={rule.id}>
                                    <td style={{ fontWeight: '700' }}>{rule.name}</td>
                                    <td>
                                        <code style={{
                                            backgroundColor: 'var(--primary-glow)',
                                            color: 'var(--primary)',
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            fontFamily: 'var(--font-geist-mono)'
                                        }}>
                                            {rule.pattern}
                                        </code>
                                    </td>
                                    <td style={{ color: 'var(--muted)', fontWeight: '600' }}>{rule.targetAccount.name}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <form action={async () => {
                                            'use server';
                                            await deleteBankRuleAction(rule.id);
                                        }}>
                                            <button className="btn-secondary-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
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
    );
}
