import { getLedgerData } from "../../lib/actions";
import Link from "next/link";
import { auth } from "@/auth";
import { HeaderWrapper } from "../../components/brand";

export default async function LedgerPage() {
    const session = await auth();
    const tenantId = (session?.user as any)?.activeTenantId;

    if (!tenantId) {
        return <div style={{ padding: '2rem' }}>Please log in to view the ledger.</div>
    }

    const entries = await getLedgerData(tenantId);

    const format = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <HeaderWrapper>
                <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    Dashboard
                </Link>
            </HeaderWrapper>

            <div style={{ padding: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    General Ledger
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {entries.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            No transactions found yet.
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <div key={entry.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                {/* Header */}
                                <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {entry.date} • ID: {entry.id.slice(0, 8)}...
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '0.2rem' }}>
                                            {entry.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Lines */}
                                <div style={{ padding: '1rem 1.5rem' }}>
                                    {entry.lines.map((line) => (
                                        <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{line.account.code}</span>
                                                <span>{line.account.name}</span>
                                            </div>

                                            {line.debitCents > 0 && (
                                                <div style={{ color: '#f8fafc', fontWeight: '500' }}>
                                                    {format(line.debitCents)} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>DR</span>
                                                </div>
                                            )}
                                            {line.debitCents === 0 && <div />} {/* Spacer */}

                                            {line.creditCents > 0 && (
                                                <div style={{ color: '#f8fafc', fontWeight: '500' }}>
                                                    {format(line.creditCents)} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>CR</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Total Check (Optional visual verification, debits should equal credits) */}
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#475569', textAlign: 'right' }}>
                                        Total: {format(entry.lines.reduce((s, l) => s + l.debitCents, 0))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
