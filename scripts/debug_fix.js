const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined
});

async function main() {
    console.log("🛠 [JS] Fix Schema Script Starting...");

    try {
        const client = await pool.connect();
        console.log("✅ DB Connected via pg driver!");

        // 1. Create Suppliers
        console.log("Creating 'suppliers' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id text PRIMARY KEY,
                tenant_id text NOT NULL,
                name text NOT NULL,
                email text,
                address text,
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);

        // 2. Create Bills
        console.log("Creating 'bills' table...");
        await client.query(`
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

        // 3. Create Bill Lines
        console.log("Creating 'bill_lines' table...");
        await client.query(`
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

        console.log("✅ Schema Fix Completed Successfully!");

        client.release();
    } catch (e) {
        console.error("❌ DB Error:", e);
    } finally {
        await pool.end();
    }
}

main();
