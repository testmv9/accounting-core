import Link from 'next/link';

export function Logo({ size = 42 }: { size?: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.3))' }}
            >
                <defs>
                    <linearGradient id="ocean-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>

                {/* The Va'a (Canoe Hulls) - Representing stability & journey */}
                <path
                    d="M8 32C12 30 20 30 24 32M28 32C32 30 36 30 40 32"
                    stroke="url(#ocean-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* The Sail - Abstractly forming an 'N' & Catching the wind */}
                <path
                    d="M16 30V8L28 22V8"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.9 }}
                />

                {/* The Guiding Stars (Southern Cross / Wayfinding) */}
                <circle cx="34" cy="6" r="1.5" fill="white" />
                <circle cx="38" cy="10" r="1" fill="white" style={{ opacity: 0.6 }} />
                <circle cx="34" cy="14" r="1" fill="white" style={{ opacity: 0.8 }} />
                <circle cx="30" cy="10" r="1" fill="white" style={{ opacity: 0.5 }} />

                {/* Ocean Swell Pattern (Koru inspired) */}
                <path
                    d="M4 38C10 36 14 40 20 38C26 36 30 40 36 38"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
            <span style={{
                fontSize: size * 0.65,
                fontWeight: '800',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(to right, #fff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                fontFamily: 'var(--font-geist-sans), sans-serif',
                textTransform: 'uppercase'
            }}>
                Navera
            </span>
        </div>
    );
}

