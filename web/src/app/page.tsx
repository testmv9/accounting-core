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
    console.log('Rendering Landing Page');
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Navigation */}
        <nav style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.4rem', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', borderRadius: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.025em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NAVERA</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Sign In</a>
            <a href="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', textDecoration: 'none' }}>Start Free Trial</a>
          </div>
        </nav>

        {/* Hero Section */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 2rem 4rem 2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '9999px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold', marginBottom: '2rem' }}>
            NEW: MULTI-TENANT CLOUD ARCHITECTURE IS LIVE
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem', background: 'linear-gradient(to bottom, #fff 40%, #64748b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.04em' }}>
            The Ledger for the<br />Next Generation.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
            Navera combines the precision of double-entry accounting with a navigator&apos;s intuition. Secure. Real-time. Built for growth.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none' }}>
              Launch Your Business →
            </a>
          </div>

          <div style={{ marginTop: '6rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>
            <div className="card" style={{ position: 'relative', zIndex: 1, padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div style={{ height: '400px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#38bdf8', fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>Interactive Dashboard Preview</div>
                  <p style={{ color: '#64748b' }}>Real-time cashflow, aged receivables, and balance sheets.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  console.log('Fetching Dashboard Data for Tenant:', tenantId);
  const [accounts, unreconciled] = await Promise.all([
    getDashboardData(tenantId),
    getUnreconciledTransactionsAction(tenantId)
  ]);

  // Quick calculations for the "Big Numbers"
  const totalAssets = accounts
    .filter(a => a.type === 'ASSET')
    .reduce((sum, a) => sum + a.balanceCents, 0);

  const totalRevenue = accounts
    .filter(a => a.type === 'REVENUE')
    .reduce((sum, a) => sum + Math.abs(a.balanceCents), 0); // Revenue is typically Cr (negative) but we show abs

  const format = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <HeaderWrapper>
        <Link href="/accounts" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Accounts
        </Link>
        <Link href="/ledger" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Ledger
        </Link>
        <Link href="/reports/pnl" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          P&L
        </Link>
        <Link href="/reports/aged-receivables" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Receivables ⌛
        </Link>
        <Link href="/invoices" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Invoices
        </Link>
        <Link href="/bills" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Bills
        </Link>
        <Link href="/banking/reconcile" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Banking 🏦
        </Link>
        <form action={async () => {
          "use server"
          await signOut()
        }}>
          <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#f87171', border: 'none' }}>
            Logout
          </button>
        </form>
      </HeaderWrapper>

      <div style={{ padding: '2rem 2rem 0 2rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Wayfinder: {session?.user?.name || 'User'}</p>
      </div>

      {unreconciled.length > 0 && (
        <div style={{ margin: '0 2rem 2rem 2rem' }}>
          <Link href="/banking/reconcile" style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(45deg, rgba(56, 189, 248, 0.1), rgba(52, 211, 153, 0.1))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '1.25rem 2rem',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🏦</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>Reconciliation Required</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>You have <strong>{unreconciled.length}</strong> transactions waiting to be matched.</div>
                </div>
              </div>
              <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>Review Now →</div>
            </div>
          </Link>
        </div>
      )}

      {/* Watchlist Section */}
      {accounts.some(a => a.showOnDashboard) && (
        <>
          <h2 className="section-title">Account Watchlist</h2>
          <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            {accounts.filter(a => a.showOnDashboard).map((acc) => (
              <div key={acc.id} className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="card-header">{acc.code}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{acc.type}</span>
                </div>
                <div className="card-value" style={{ fontSize: '1.5rem' }}>
                  {acc.formattedBalance}
                </div>
                <div className="card-label">{acc.name}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* KPI Section */}
      <h2 className="section-title">Key Metrics</h2>
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">Cash & Assets</div>
          <div className="card-value text-success">{format(totalAssets)}</div>
          <div className="card-label">Total liquidity available</div>
        </div>

        <div className="card">
          <div className="card-header">Revenue YTD</div>
          <div className="card-value">{format(totalRevenue)}</div>
          <div className="card-label">Total sales performance</div>
        </div>

        <div className="card">
          <div className="card-header">Net Runway</div>
          <div className="card-value">∞</div>
          <div className="card-label">Based on current burn rate</div>
        </div>
      </div>

      {/* Action Section */}
      <div style={{ padding: '0 2rem' }}>
        <TransactionForm accounts={accounts} tenantId={tenantId} />
      </div>

      {/* Balances Section */}
      <h2 className="section-title">Account Balances</h2>
      <div className="dashboard-grid">
        {accounts.map((acc) => (
          <div key={acc.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="card-header">{acc.code} • {acc.type}</span>
              {acc.type === 'ASSET' || acc.type === 'EXPENSE' ? <span style={{ color: '#34d399', fontSize: '10px' }}>DR</span> : <span style={{ color: '#f87171', fontSize: '10px' }}>CR</span>}
            </div>
            <div className="card-value" style={{ fontSize: '1.5rem' }}>
              {acc.formattedBalance}
            </div>
            <div className="card-label">{acc.name}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
