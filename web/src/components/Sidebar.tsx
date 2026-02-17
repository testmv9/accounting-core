import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "./brand";
import ThemeToggle from "./ThemeToggle";

const NavItem = ({ href, icon, label, badge, active }: { href: string; icon: React.ReactNode; label: string; badge?: number; active?: boolean }) => (
    <Link href={href} className={`nav-link ${active ? 'active' : ''}`}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {badge ? (
            <span style={{
                background: 'var(--primary)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '0.1rem 0.4rem',
                borderRadius: '10px'
            }}>
                {badge}
            </span>
        ) : null}
    </Link>
);

export default async function Sidebar({ unreconciledCount }: { unreconciledCount: number }) {
    const session = await auth();

    return (
        <aside className="sidebar">
            <div style={{ marginBottom: '3rem', padding: '0 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <Logo size={32} />
                </Link>
                <ThemeToggle />
            </div>

            <nav style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                flex: 1,
                overflowY: 'auto',
                paddingRight: '0.5rem',
                marginRight: '-0.5rem',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }} className="sidebar-nav">
                <NavItem href="/" icon="📊" label="Dashboard" active />
                <NavItem href="/banking/reconcile" icon="🏦" label="Banking" badge={unreconciledCount} />
                <NavItem href="/invoices" icon="📄" label="Invoices" />
                <NavItem href="/bills" icon="💸" label="Bills" />
                <NavItem href="/accounts" icon="🗂️" label="Chart of Accounts" />
                <NavItem href="/ledger" icon="📖" label="General Ledger" />

                <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', padding: '0 1rem', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Financial Reports
                </div>
                <NavItem href="/reports/pnl" icon="📊" label="Profit & Loss" />
                <NavItem href="/reports/aged-receivables" icon="⏳" label="Aged Receivables" />

                <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', padding: '0 1rem', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    System
                </div>
                <NavItem href="/settings" icon="⚙️" label="Settings" />
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <Link href="/settings" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
                        {session?.user?.name?.[0] || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>Pro Trial</div>
                    </div>
                </Link>
                <form action={async () => {
                    'use server'
                    await signOut()
                }}>
                    <button type="submit" className="nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                        <span>🚪</span>
                        <span>Sign Out</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}
