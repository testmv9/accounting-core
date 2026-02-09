import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            console.log('--- AUTH CHECK ---', { path: nextUrl.pathname, isLoggedIn });

            const isProtectedPath = nextUrl.pathname.startsWith('/accounts') ||
                nextUrl.pathname.startsWith('/ledger') ||
                nextUrl.pathname.startsWith('/invoices') ||
                nextUrl.pathname.startsWith('/bills') ||
                nextUrl.pathname.startsWith('/banking') ||
                nextUrl.pathname.startsWith('/reports');

            const isOnLoginPage = nextUrl.pathname.startsWith('/login');
            const isOnRegisterPage = nextUrl.pathname.startsWith('/register');

            if (isProtectedPath) {
                if (isLoggedIn) return true
                return Response.redirect(new URL('/login', nextUrl))
            }

            if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
                return Response.redirect(new URL('/', nextUrl))
            }

            return true
        },
    },
    providers: [], // Empty array for now, we'll add it in auth.ts
} satisfies NextAuthConfig
