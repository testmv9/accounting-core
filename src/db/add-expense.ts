import { AccountingRepo } from "../repo";
import { pool } from "./index";

async function main() {
    const tenantId = "demo-tenant";

    console.log("🌱 Creating Expense Account...");

    const expense = await AccountingRepo.createAccount({
        tenantId,
        code: "500",
        name: "Office Expenses",
        type: "EXPENSE",
        isSystem: true
    });

    console.log(`✅ Created account: [${expense.code}] ${expense.name}`);

    // Clean up connection
    await pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
