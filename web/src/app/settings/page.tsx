import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = session.user;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Account Settings</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Control your profile preferences and subscription status</p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2.5rem', maxWidth: '1000px' }}>
                {/* Profile Section */}
                <section className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--foreground)' }}>User Profile</h2>
                    <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                            <input
                                className="input-premium"
                                defaultValue={user?.name || ''}
                                disabled
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                            <input
                                className="input-premium"
                                defaultValue={user?.email || ''}
                                disabled
                            />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>
                            Profile editing is managed via your linked identity provider.
                        </p>
                    </div>
                </section>

                {/* Subscription Section */}
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--foreground)' }}>Plan & Subscription</h2>
                            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>You are currently on a priority trial of the Pro Plan.</p>
                        </div>
                        <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Trial Mode
                        </span>
                    </div>

                    <div style={{ background: 'var(--surface-hover)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--foreground)' }}>Trial progress</span>
                            <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700' }}>3 days remaining</span>
                        </div>
                        <div style={{ height: '10px', background: 'var(--background)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                            <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-premium" style={{ flex: 1 }}>Upgrade to Pro</button>
                        <button className="btn-secondary-premium" style={{ flex: 1 }}>View Pricing</button>
                    </div>
                </section>

                {/* Trial Management (The Danger Zone) */}
                <section className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--danger)' }}>Danger Zone</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                        Resetting your trial will clear all current accounting data and restart your 3-day window. This action is irreversible.
                    </p>
                    <button className="btn-secondary-premium" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', width: 'fit-content' }}>
                        Reset Trial & Wipe Data
                    </button>
                </section>
            </div>
        </div>
    );
}
