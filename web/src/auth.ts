import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { AccountingRepo } from "@core/repo"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const user = await AccountingRepo.getUserByEmail(credentials?.email as string);

                // In a real app, use bcrypt to compare hashes
                if (user && user.passwordHash === credentials?.password) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        activeTenantId: user.memberships[0]?.tenantId
                    }
                }
                return null
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }: { session: any, token: any }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                (session.user as any).activeTenantId = token.activeTenantId;
            }
            return session;
        },
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.activeTenantId = (user as any).activeTenantId;
            }
            return token;
        },
    }
})
