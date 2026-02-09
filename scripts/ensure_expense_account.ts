import { AccountingRepo } from "../src/repo";
import { pool } from "../src/db";
import { db } from "../src/db";
import { accounts } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    const tenantId = "demo-tenant";
    console.log("Checking for Expense Account...");

    const expenseAccount = await db.query.accounts.findFirst({
        where: (a, { eq, and }) => and(eq(a.tenantId, tenantId), eq(a.code, "500"))
    });

    if (!expenseAccount) {
        console.log("Creating 'Office Supplies' (500)...");
        await AccountingRepo.createAccount({
            tenantId,
            code: "500",
            name: "Office Supplies",
            type: "EXPENSE",
            isSystem: true
        });
    } else {
        console.log("✅ 'Office Supplies' already exists.");
    }

    const apAccount = await db.query.accounts.findFirst({
        where: (a, { eq, and }) => and(eq(a.tenantId, tenantId), eq(a.code, "200"))
    });

    if (!apAccount) {
        console.log("Creating 'Accounts Payable' (200)...");
        await AccountingRepo.createAccount({
            tenantId,
            code: "200",
            name: "Accounts Payable",
            type: "LIABILITY",
            isSystem: true
        });
    } else {
        console.log("✅ 'Accounts Payable' already exists.");
    }

    await pool.end();
}

main().catch(console.error);
