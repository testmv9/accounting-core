import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Checking DB connection...");
    try {
        const result = await db.execute(sql`SELECT 1 as res`);
        console.log("✅ DB Connected!", result);
        process.exit(0);
    } catch (err) {
        console.error("❌ DB Connection Failed:", err);
        process.exit(1);
    }
}

main();
