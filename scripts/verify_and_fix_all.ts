import { sql, eq, and } from "drizzle-orm";
import { db, pool } from "../src/db";
import { accounts } from "../src/db/schema";
import { createId } from "@paralleldrive/cuid2";

async function main() {
    console.log("🛠 Verifying System Configuration...");
    const tenantId = "demo-tenant";

    try {
        // 1. Verify Tables
        console.log("--> Checking 'bills' table...");
        const res = await db.execute(sql`SELECT to_regclass('public.bills') as exists;`);
        if (!res.rows[0].exists) {
            console.log("❌ 'bills' table MISSING. Attempting to create schemas...");
            // Run schema fix logic here inline
            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS suppliers (
                    id text PRIMARY KEY,
                    tenant_id text NOT NULL,
                    name text NOT NULL,
                    email text,
                    address text,
                    created_at timestamp DEFAULT now() NOT NULL
                );
                CREATE TABLE IF NOT EXISTS bills (
                    id text PRIMARY KEY,
                    tenant_id text NOT NULL,
                    bill_number text NOT NULL,
                    supplier_id text NOT NULL REFERENCES suppliers(id),
                    issue_date text NOT NULL,
                    due_date text NOT NULL,
                    status text DEFAULT 'DRAFT' NOT NULL,
                    amount_cents integer DEFAULT 0 NOT NULL,
                    created_at timestamp DEFAULT now() NOT NULL
                );
                CREATE TABLE IF NOT EXISTS bill_lines (
                    id text PRIMARY KEY,
                    bill_id text NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
                    description text NOT NULL,
                    quantity integer DEFAULT 1 NOT NULL,
                    unit_price_cents integer DEFAULT 0 NOT NULL,
                    amount_cents integer DEFAULT 0 NOT NULL,
                    expense_account_id text REFERENCES accounts(id)
                );
            `);
            console.log("✅ Created missing tables.");
        } else {
            console.log("✅ 'bills' table exists.");
        }

        // 1b. Verify Banking Tables
        console.log("--> Checking 'bank_transactions' table...");
        const bankRes = await db.execute(sql`SELECT to_regclass('public.bank_transactions') as exists;`);
        if (!bankRes.rows[0].exists) {
            console.log("❌ 'bank_transactions' table MISSING. Creating...");
            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS bank_transactions (
                    id text PRIMARY KEY,
                    tenant_id text NOT NULL,
                    bank_account_id text NOT NULL REFERENCES accounts(id),
                    date text NOT NULL,
                    amount_cents integer DEFAULT 0 NOT NULL,
                    description text NOT NULL,
                    status text DEFAULT 'PENDING' NOT NULL,
                    matched_entry_id text REFERENCES journal_entries(id),
                    created_at timestamp DEFAULT now() NOT NULL
                );
            `);
            console.log("✅ Created 'bank_transactions' table.");
        } else {
            console.log("✅ 'bank_transactions' table exists.");
        }

        // 2. Verify Accounts Payable
        console.log("--> Checking 'Accounts Payable' (200)...");
        const apAccount = await db.query.accounts.findFirst({
            where: (a, { eq, and }) => and(eq(a.tenantId, tenantId), eq(a.code, "200"))
        });

        if (!apAccount) {
            console.log("❌ 'Accounts Payable' MISSING. Creating...");
            await db.insert(accounts).values({
                id: createId(),
                tenantId,
                code: "200",
                name: "Accounts Payable",
                type: "LIABILITY",
                isSystem: true,
                showOnDashboard: true,
                isArchived: false
            });
            console.log("✅ Created 'Accounts Payable'.");
        } else {
            console.log("✅ 'Accounts Payable' exists.");
        }

        // 3. Verify Expense Account (Office Supplies)
        console.log("--> Checking 'Office Supplies' (500)...");
        const expenseAccount = await db.query.accounts.findFirst({
            where: (a, { eq, and }) => and(eq(a.tenantId, tenantId), eq(a.code, "500"))
        });

        if (!expenseAccount) {
            console.log("❌ 'Office Supplies' MISSING. Creating...");
            await db.insert(accounts).values({
                id: createId(),
                tenantId,
                code: "500",
                name: "Office Supplies",
                type: "EXPENSE",
                isSystem: true,
                showOnDashboard: true,
                isArchived: false
            });
            console.log("✅ Created 'Office Supplies'.");
        } else {
            console.log("✅ 'Office Supplies' exists.");
        }

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
