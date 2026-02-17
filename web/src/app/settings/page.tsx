import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = session.user;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>Account Settings</h1>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Manage your profile and subscription</p>
            </header>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Profile Section */}
                <section className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--foreground)' }}>User Profile</h2>
                    <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '500px' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
                            <input
                                className="input-premium"
                                defaultValue={user?.name || ''}
                                disabled
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                            <input
                                className="input-premium"
                                defaultValue={user?.email || ''}
                                disabled
                            />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            Profile editing is managed via your identity provider.
                        </p>
                    </div>
                </section>

                {/* Subscription Section */}
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--foreground)' }}>Plan & Subscription</h2>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>You are currently on a trial of the Pro Plan.</p>
                        </div>
                        <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                            Trial Mode
                        </span>
                    </div>

                    <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Trial Progress</span>
                            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>3 days remaining</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-premium" style={{ flex: 1 }}>Upgrade to Pro</button>
                        <button className="nav-link" style={{ flex: 1, justifyContent: 'center', border: '1px solid var(--glass-border)' }}>View Pricing</button>
                    </div>
                </section>

                {/* Trial Management (The "IF you know what I mean" part) */}
                <section className="card" style={{ borderColor: 'var(--danger-glow, rgba(239, 68, 68, 0.2))' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--danger)' }}>Danger Zone</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Resetting your trial will clear all current accounting data and restart your 3-day window. This cannot be undone.
                    </p>
                    <button className="nav-link" style={{ color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.75rem 1.5rem', fontWeight: '700' }}>
                        Reset Trial & Wipe Data
                    </button>
                </section>
            </div>
        </div>
    );
}
