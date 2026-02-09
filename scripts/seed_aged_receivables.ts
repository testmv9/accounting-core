import { AccountingRepo } from "../src/repo";

async function seed() {
    try {
        const tenantId = 'demo-tenant';

        // Find or create a customer
        let customers = await AccountingRepo.listCustomers(tenantId);
        if (customers.length === 0) {
            await AccountingRepo.createCustomer({ tenantId, name: 'Major Client Inc.' });
            customers = await AccountingRepo.listCustomers(tenantId);
        }

        const customer = customers[0];
        if (!customer) {
            throw new Error("Failed to find or create customer");
        }
        const customerId = customer.id;

        // Create a series of invoices with different due dates
        const today = new Date();

        const scenarios = [
            { daysAgo: 5, label: 'Current Item', amount: 120000 }, // $1200
            { daysAgo: 15, label: 'Early Overdue', amount: 85000 },
            { daysAgo: 45, label: 'Older Debt', amount: 50000 },
            { daysAgo: 100, label: 'Critical Debt', amount: 25000 }
        ];

        const accounts = await AccountingRepo.listAccounts(tenantId);
        const revenueAccount = accounts.find(a => a.type === 'REVENUE');

        if (!revenueAccount || !revenueAccount.id) {
            throw new Error("Seed failed: No REVENUE account found for tenant " + tenantId);
        }

        const revAccId = revenueAccount.id;

        for (const s of scenarios) {
            try {
                const date = new Date(today.getTime());
                date.setDate(date.getDate() - s.daysAgo);
                const isoDate = date.toISOString().split('T')[0] ?? '';

                const issueDate = new Date(date.getTime());
                issueDate.setDate(issueDate.getDate() - 30);
                const isoIssueDate = issueDate.toISOString().split('T')[0] ?? '';

                if (!isoDate || !isoIssueDate) {
                    throw new Error("Date formatting failed");
                }

                console.log(`Creating invoice for ${s.label}...`);
                const inv = await AccountingRepo.createInvoice({
                    tenantId,
                    customerId,
                    issueDate: isoIssueDate,
                    dueDate: isoDate,
                    lines: [{
                        description: s.label,
                        quantity: 1,
                        unitPriceCents: s.amount,
                        revenueAccountId: revAccId
                    }]
                });

                if (inv && inv.id) {
                    console.log(`Approving invoice ${inv.id}...`);
                    await AccountingRepo.approveInvoice(inv.id);
                    console.log(`✅ Success: ${s.label} due ${isoDate}`);
                } else {
                    console.error(`❌ Failed: Invoice creation returned null for ${s.label}`);
                }
            } catch (e) {
                const errorMsg = (e instanceof Error) ? e.message : String(e);
                console.error(`❌ Failed on ${s.label}:`, errorMsg);
            }
        }
        console.log("Seed finished successfully.");
        process.exit(0);
    } catch (err) {
        const fatalMsg = (err instanceof Error) ? err.message : String(err);
        console.error("FATAL ERROR:", fatalMsg);
        process.exit(1);
    }
}

seed().catch(err => {
    console.error("UNHANDLED FATAL:", err);
    process.exit(1);
});
