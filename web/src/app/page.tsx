import Link from "next/link";
import { getDashboardData, getUnreconciledTransactionsAction } from "../lib/actions";
import TransactionForm from "../components/transaction-form";
import { auth, signOut } from "@/auth";
import { HeaderWrapper } from "../components/brand";

export default async function Dashboard() {
  const session = await auth();
  const tenantId = (session?.user as any)?.activeTenantId;
  console.log('Dashboard Render Start', { tenantId });

  if (!tenantId) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
        <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.4rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '8px', display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.025em' }}>NAVERA</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/login" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>Sign In</Link>
            <Link href="/register" className="btn-premium">Start Building</Link>
          </div>
        </nav>

        <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '10rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '900', letterSpacing: '-0.05em', marginBottom: '1.5rem' }}>
            Ledger for the<br /><span style={{ color: 'var(--primary)' }}>Next Generation.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
            Double-entry precision meets cloud-native intuition. Secure, multi-tenant, and built for modern enterprise.
          </p>
          <Link href="/register" className="btn-premium" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            Launch Your Business →
          </Link>
        </main>
      </div>
    );
  }

  const [accounts, unreconciled] = await Promise.all([
    getDashboardData(tenantId),
    getUnreconciledTransactionsAction(tenantId)
  ]);

  const totalAssets = accounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + a.balanceCents, 0);
  const totalRevenue = accounts.filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + Math.abs(a.balanceCents), 0);
  const format = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>Financial Command</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Welcome back, {session?.user?.name || 'Commander'}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/banking/reconcile" className="btn-premium">
              <span>🏦</span> Banking
            </Link>
          </div>
        </div>
      </header>

      {unreconciled.length > 0 && (
        <Link href="/banking/reconcile" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1), transparent)', borderColor: 'var(--primary-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>❕</div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>Reconciliation Required</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>You have <strong>{unreconciled.length}</strong> transactions waiting for review.</div>
              </div>
            </div>
            <div style={{ color: 'var(--primary)', fontWeight: '700' }}>Process Now →</div>
          </div>
        </Link>
      )}

      {/* KPI Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Total Cash & Assets</div>
            <div className="stat-value" style={{ color: 'var(--success)', background: 'none', WebkitTextFillColor: 'unset' }}>{format(totalAssets)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600' }}>
              <span>↑ 12%</span>
              <span style={{ color: 'var(--muted)', fontWeight: '400' }}>vs last month</span>
            </div>
          </div>

          <div className="card">
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Revenue YTD</div>
            <div className="stat-value">{format(totalRevenue)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
              <span>Stable performance</span>
            </div>
          </div>

          <div className="card">
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Net Runway</div>
            <div className="stat-value" style={{ color: 'var(--primary)', background: 'none', WebkitTextFillColor: 'unset' }}>∞</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>
              <span>Infinite</span>
              <span style={{ color: 'var(--muted)', fontWeight: '400' }}>burn rate neutral</span>
            </div>
          </div>
        </div>
      </section>

      {/* Watchlist Section */}
      {accounts.some(a => a.showOnDashboard) && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--primary)' }}>◈</span> Account Watchlist
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {accounts.filter(a => a.showOnDashboard).map((acc) => (
              <div key={acc.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ background: 'var(--surface-hover)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted)' }}>{acc.code}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>{acc.type}</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' }}>
                  {acc.formattedBalance}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{acc.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Section */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--secondary)' }}>◈</span> Quick Entry
        </h2>
        <div className="card">
          <TransactionForm accounts={accounts} tenantId={tenantId} />
        </div>
      </section>

      {/* Full Balances */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--muted)' }}>◈</span> Full Ledger Overview
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>Account</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: '700', color: '#fff' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{acc.code}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '700' }}>{acc.type}</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>{acc.formattedBalance}</div>
                    <div style={{ fontSize: '0.65rem', color: acc.type === 'ASSET' || acc.type === 'EXPENSE' ? 'var(--success)' : 'var(--danger)', fontWeight: '900' }}>
                      {acc.type === 'ASSET' || acc.type === 'EXPENSE' ? 'DEBIT' : 'CREDIT'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
