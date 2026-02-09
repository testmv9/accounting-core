import { sql } from "drizzle-orm";
import { db, pool } from "../src/db";

async function main() {
    console.log("🔍 Checking database tables...");
    try {
        const res = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        console.log("Tables found:");
        res.rows.forEach((row: any) => console.log(` - ${row.table_name}`));

        const billsExist = res.rows.some((row: any) => row.table_name === 'bills');
        if (billsExist) {
            console.log("\n✅ 'bills' table exists!");
        } else {
            console.log("\n❌ 'bills' table is MISSING!");
        }

    } catch (e) {
        console.error("Error querying DB:", e);
    } finally {
        await pool.end();
    }
}

main();
