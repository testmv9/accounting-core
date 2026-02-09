import { sql } from "drizzle-orm";
import { db, pool } from "../src/db";

async function main() {
    console.log("🛠 Checking/Fixing database schema manually...");

    try {
        // Suppliers Table
        console.log("Creating 'suppliers' table if needed...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS suppliers (
                id text PRIMARY KEY,
                tenant_id text NOT NULL,
                name text NOT NULL,
                email text,
                address text,
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);

        // Bills Table
        console.log("Creating 'bills' table if needed...");
        await db.execute(sql`
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
        `);

        // Bill Lines Table
        // Note: expense_account_id references accounts(id), assuming accounts table exists
        console.log("Creating 'bill_lines' table if needed...");
        await db.execute(sql`
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

        console.log("✅ Tables checked/created successfully!");

    } catch (e) {
        console.error("❌ Schema Fix Failed:", e);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main().catch(console.error);
