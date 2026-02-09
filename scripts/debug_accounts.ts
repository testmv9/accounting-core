import { db, pool } from "../src/db";
import { accounts } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const tenantId = "demo-tenant";
    console.log(`Checking accounts for tenant: ${tenantId}`);

    const allAccounts = await db.select().from(accounts).where(eq(accounts.tenantId, tenantId));

    console.log("Found Accounts:");
    allAccounts.forEach(a => {
        console.log(` - [${a.code}] ${a.name} (${a.type})`);
    });

    const ap = allAccounts.find(a => a.name.includes("Payable"));
    if (ap) {
        console.log(`✅ Accounts Payable found: ${ap.id}`);
    } else {
        console.log(`❌ Accounts Payable NOT FOUND.`);
    }

    await pool.end();
}

main();
