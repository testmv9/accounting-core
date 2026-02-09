import Link from "next/link";
import { registerUserAction } from "../../lib/actions";

export default function RegisterPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle at top right, #1e293b, #020617)',
            padding: '1rem'
        }}>
            {/* Ambient Background elements */}
            <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(56, 189, 248, 0.1)', filter: 'blur(100px)', top: '10%', right: '10%', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'rgba(129, 140, 248, 0.05)', filter: 'blur(80px)', bottom: '10%', left: '15%', borderRadius: '50%' }}></div>

            <div className="card" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '2.5rem',
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.4rem', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', borderRadius: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em', color: '#fff' }}>NAVERA</span>
                    </a>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Launch Your Business</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Create your multi-tenant accounting hub in seconds.</p>
                </div>

                <form action={registerUserAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' }}>FULL NAME</label>
                            <input name="name" type="text" placeholder="John Doe" className="input" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' }}>BUSINESS NAME</label>
                            <input name="businessName" type="text" placeholder="Acme Inc" className="input" required style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
                        <input name="email" type="email" placeholder="john@example.com" className="input" required style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' }}>PASSWORD</label>
                        <input name="password" type="password" placeholder="••••••••" className="input" required style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.75rem', fontWeight: 'bold' }}>
                        Create My Account →
                    </button>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Already have an account? <a href="/login" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '600' }}>Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
