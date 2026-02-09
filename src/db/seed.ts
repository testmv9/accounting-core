import { AccountingRepo } from "../repo";
import { pool } from "./index";

async function main() {
    const tenantId = "demo-tenant";

    console.log("🌱 Seeding database...");

    // 1. Create System Accounts
    console.log("Creating accounts...");

    const bank = await AccountingRepo.createAccount({
        tenantId,
        code: "100",
        name: "Bank",
        type: "ASSET",
        isSystem: true
    });

    const equity = await AccountingRepo.createAccount({
        tenantId,
        code: "300",
        name: "Owner Equity",
        type: "EQUITY",
        isSystem: true
    });

    const revenue = await AccountingRepo.createAccount({
        tenantId,
        code: "400",
        name: "Sales Revenue",
        type: "REVENUE",
        isSystem: true
    });

    console.log(`✅ Created accounts: ${bank.name}, ${equity.name}, ${revenue.name}`);

    // 2. Post Initial Investment
    console.log("Posting Journal Entry: Owner Investment...");

    await AccountingRepo.postJournalEntry({
        tenantId,
        date: "2024-01-01",
        description: "Initial Investment",
        lines: [
            { accountId: bank.id, debitCents: 100000, creditCents: 0 }, // +$1000
            { accountId: equity.id, debitCents: 0, creditCents: 100000 } // -$1000
        ]
    });

    // 3. Post a Sale
    console.log("Posting Journal Entry: New Sale...");

    await AccountingRepo.postJournalEntry({
        tenantId,
        date: "2024-01-02",
        description: "Consulting Services",
        lines: [
            { accountId: bank.id, debitCents: 5000, creditCents: 0 },   // +$50
            { accountId: revenue.id, debitCents: 0, creditCents: 5000 } // -$50 (Revenue is Credit)
        ]
    });

    // 4. Create AR Account (Required for Invoicing)
    console.log("Creating Accounts Receivable...");
    await AccountingRepo.createAccount({
        tenantId,
        code: "120",
        name: "Accounts Receivable",
        type: "ASSET",
        isSystem: true
    });

    // 5. Create Sample Customer
    console.log("Creating Sample Customer...");
    await AccountingRepo.createCustomer({
        tenantId,
        name: "Acme Corp",
        email: "billing@acme.com",
        address: "123 Market St, San Francisco, CA"
    });

    // 6. Create AP and Expense Accounts (Required for Bills)
    console.log("Creating Accounts Payable & Expenses...");
    await AccountingRepo.createAccount({
        tenantId,
        code: "200",
        name: "Accounts Payable",
        type: "LIABILITY",
        isSystem: true
    });

    await AccountingRepo.createAccount({
        tenantId,
        code: "500",
        name: "Office Supplies",
        type: "EXPENSE",
        isSystem: true
    });

    // 7. Create Sample Supplier
    console.log("Creating Sample Supplier...");
    await AccountingRepo.createSupplier({
        tenantId,
        name: "Office Depot",
        email: "store@officedepot.com",
        address: "Business Park, CA"
    });

    // 4. Verify Balance
    const bankBalance = await AccountingRepo.getBalance(bank.id);
    console.log(`\n💰 Final Bank Balance: $${(bankBalance / 100).toFixed(2)}`);

    // Clean up connection
    await pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
