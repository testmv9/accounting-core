import { getLedgerData } from "../../lib/actions";
import Link from "next/link";
import { auth } from "@/auth";

export default async function LedgerPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view the ledger.</div>
    }

    const entries = await getLedgerData(tenantId);
    const format = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">General Ledger</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Full double-entry record of all organizational activities</p>
                </div>
                <Link href="/" className="btn-secondary-premium">
                    Dashboard
                </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {entries.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📖</div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>No journal entries yet.</h2>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div key={entry.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ padding: '1.25rem 1.75rem', background: 'var(--surface-hover)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {entry.date} • ID: {entry.id.slice(0, 8)}...
                                    </div>
                                    <div style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: '0.2rem', color: 'var(--foreground)' }}>
                                        {entry.description}
                                    </div>
                                </div>
                            </div>

                            {/* Lines */}
                            <div style={{ padding: '1.25rem 1.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {entry.lines.map((line) => (
                                        <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '800', fontFamily: 'var(--font-geist-mono)' }}>{line.account.code}</span>
                                                <span style={{ fontWeight: '600' }}>{line.account.name}</span>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                {line.debitCents > 0 && (
                                                    <span style={{ fontWeight: '700', color: 'var(--foreground)' }}>
                                                        {format(line.debitCents)} <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '800', marginLeft: '2px' }}>DEBIT</span>
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                {line.creditCents > 0 && (
                                                    <span style={{ fontWeight: '700', color: 'var(--foreground)' }}>
                                                        {format(line.creditCents)} <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '800', marginLeft: '2px' }}>CREDIT</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'right', fontWeight: '600' }}>
                                    Record Total: {format(entry.lines.reduce((s, l) => s + l.debitCents, 0))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
