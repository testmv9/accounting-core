import { sql } from "drizzle-orm";
import { db, pool } from "../src/db";

async function main() {
    console.log("🛠 Creating 'bank_transactions' table...");

    try {
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
        console.log("✅ 'bank_transactions' table created.");
    } catch (e) {
        console.error("❌ Error creating table:", e);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
