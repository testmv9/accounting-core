import { signIn } from "@/auth"
import Link from "next/link"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
    const { registered } = await searchParams;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle at top right, #1e293b, #020617)',
            padding: '1rem'
        }}>
            {/* Ambient Background elements */}
            <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(56, 189, 248, 0.15)', filter: 'blur(100px)', top: '10%', left: '10%', borderRadius: '50%' }}></div>

            {registered && (
                <div style={{
                    maxWidth: '420px',
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(52, 211, 153, 0.1)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '12px',
                    color: '#34d399',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    ✨ Account Created! Please sign in to launch your business.
                </div>
            )}
            <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'rgba(129, 140, 248, 0.1)', filter: 'blur(80px)', bottom: '20%', right: '15%', borderRadius: '50%' }}></div>

            <div className="card" style={{
                width: '100%',
                maxWidth: '420px',
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
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Welcome Back</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Secure access to your enterprise ledger.</p>
                </div>

                <form
                    action={async (formData) => {
                        "use server"
                        try {
                            await signIn("credentials", formData, { redirectTo: '/' })
                        } catch (error) {
                            if ((error as Error).message.includes('NEXT_REDIRECT')) {
                                throw error;
                            }
                            console.error('Login error:', error);
                            throw error;
                        }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginLeft: '0.2rem' }}>EMAIL ADDRESS</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="name@company.com"
                            defaultValue="admin@company.com"
                            className="input"
                            required
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginLeft: '0.2rem' }}>PASSWORD</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            defaultValue="admin"
                            className="input"
                            required
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem' }}
                        />
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem', fontWeight: 'bold' }}>
                        Sign In to Dashboard
                    </button>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Don&apos;t have an account? <a href="/register" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '600' }}>Register your business</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
