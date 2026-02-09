import { db } from "../db";
import { users, tenants, memberships, accounts } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { LedgerRepo } from "./ledgers";

export const UserRepo = {
    async createUser(params: { name?: string; email: string; passwordHash?: string }) {
        const [user] = await db.insert(users).values({
            id: createId(),
            name: params.name ?? null,
            email: params.email,
            passwordHash: params.passwordHash ?? null
        }).returning();
        return user;
    },

    async getUserByEmail(email: string) {
        return await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.email, email),
            with: {
                memberships: {
                    with: {
                        tenant: true
                    }
                }
            }
        });
    },

    async createTenant(params: { name: string; ownerId: string }) {
        return await db.transaction(async (tx) => {
            const tenantId = createId();
            const slug = params.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).slice(2, 6);

            const [tenant] = await tx.insert(tenants).values({
                id: tenantId,
                name: params.name,
                slug: slug
            }).returning();

            await tx.insert(memberships).values({
                id: createId(),
                userId: params.ownerId,
                tenantId: tenantId,
                role: 'OWNER'
            });

            // Auto-setup basic Chart of Accounts for new tenant
            await this.setupDefaultChartOfAccounts(tenantId, tx);

            return tenant;
        });
    },

    async setupDefaultChartOfAccounts(tenantId: string, tx: any = db) {
        const defaults = [
            { code: '1000', name: 'Main Bank Account', type: 'ASSET', showOnDashboard: true },
            { code: '1200', name: 'Accounts Receivable', type: 'ASSET', showOnDashboard: true },
            { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', showOnDashboard: true },
            { code: '4000', name: 'Sales', type: 'REVENUE', showOnDashboard: false },
            { code: '6000', name: 'General Expenses', type: 'EXPENSE', showOnDashboard: false },
        ];

        for (const account of defaults) {
            await tx.insert(accounts).values({
                id: createId(),
                tenantId,
                ...account,
                isSystem: true
            });
        }
    }
};
