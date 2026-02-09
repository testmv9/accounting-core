import { db, pool } from "../src/db";
import { sql } from "drizzle-orm";

async function check() {
    try {
        const res = await db.execute(sql`SELECT count(*) FROM bank_transactions`);
        console.log("SUCCESS: Table exists, count:", res);
    } catch (e) {
        console.log("FAILURE: Table does not exist:", e.message);
    } finally {
        await pool.end();
    }
}
check();
