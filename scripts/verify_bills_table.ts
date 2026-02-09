import { sql } from "drizzle-orm";
import { db, pool } from "../src/db";

async function main() {
    console.log("🔍 Verifying 'bills' table...");
    try {
        const res = await db.execute(sql`
            SELECT to_regclass('public.bills') as exists;
        `);

        if (res.rows[0].exists) {
            console.log("✅ 'bills' table exists!");
        } else {
            console.log("❌ 'bills' table MISSING.");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

main();
