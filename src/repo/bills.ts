import { db } from "../db";
import { accounts, bills, billLines, suppliers } from "../db/schema";
import { eq, and, like } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { LedgerRepo, CreateAccountParams } from "./ledgers";

export type CreateSupplierParams = {
    tenantId: string;
    name: string;
    email?: string;
    address?: string;
};

export type CreateBillParams = {
    tenantId: string;
    supplierId: string;
    issueDate: string;
    dueDate: string;
    lines: {
        description: string;
        quantity: number;
        unitPriceCents: number;
        expenseAccountId: string;
        amountCents?: number;
    }[];
};

export const BillRepo = {
    /**
     * Create Supplier
     */
    async createSupplier(params: CreateSupplierParams) {
        const [supplier] = await db.insert(suppliers).values({
            id: createId(),
            tenantId: params.tenantId,
            name: params.name,
            email: params.email ?? null,
            address: params.address ?? null
        }).returning();
        return supplier;
    },

    /**
     * List Suppliers
     */
    async listSuppliers(tenantId: string) {
        return db.select().from(suppliers).where(eq(suppliers.tenantId, tenantId));
    },

    /**
     * Create Bill
     */
    async createBill(params: CreateBillParams) {
        return await db.transaction(async (tx) => {
            // 1. Calculate Total
            let totalCents = 0;
            const linesData = params.lines.map(l => {
                const lineTotal = l.quantity * l.unitPriceCents;
                totalCents += lineTotal;
                return { ...l, amountCents: lineTotal };
            });

            // 2. Insert Bill Header
            const billId = createId();
            const billNumber = `BILL-${Date.now().toString().slice(-6)}`;

            const [bill] = await tx.insert(bills).values({
                id: billId,
                tenantId: params.tenantId,
                billNumber: billNumber,
                supplierId: params.supplierId,
                issueDate: params.issueDate,
                dueDate: params.dueDate,
                status: 'DRAFT',
                amountCents: totalCents
            }).returning();

            // 3. Insert Lines
            for (const line of linesData) {
                await tx.insert(billLines).values({
                    id: createId(),
                    billId: billId,
                    description: line.description,
                    quantity: line.quantity,
                    unitPriceCents: line.unitPriceCents,
                    amountCents: line.amountCents,
                    expenseAccountId: line.expenseAccountId
                });
            }

            return bill;
        });
    },

    async getBill(billId: string) {
        return await db.query.bills.findFirst({
            where: (model, { eq }) => eq(model.id, billId),
            with: {
                supplier: true,
                lines: {
                    with: {
                        expenseAccount: true
                    }
                }
            }
        });
    },

    async listBills(tenantId: string) {
        return await db.query.bills.findMany({
            where: (model, { eq }) => eq(model.tenantId, tenantId),
            with: {
                supplier: true
            },
            orderBy: (model, { desc }) => desc(model.issueDate)
        });
    },

    /**
     * Approve Bill: Posts Journal Entry (Expense DR, AP CR)
     */
    async approveBill(billId: string) {
        const bill = await this.getBill(billId);
        if (!bill) throw new Error("Bill not found");
        if (bill.status !== 'DRAFT') throw new Error("Only draft bills can be approved");

        // 1. Find AP Account
        let apAccount = await db.query.accounts.findFirst({
            where: (a, { eq, and, like }) => and(eq(a.tenantId, bill.tenantId), like(a.name, '%Payable%'))
        });

        if (!apAccount) {
            // Self-healing: Create the missing account automatically
            console.log("⚠️ System: Auto-creating missing 'Accounts Payable' account.");
            const params: CreateAccountParams = {
                tenantId: bill.tenantId,
                code: "2000",
                name: "Accounts Payable",
                type: "LIABILITY",
                isSystem: true,
                showOnDashboard: true
            };

            // Re-use logic or call createAccount directly
            apAccount = await LedgerRepo.createAccount(params);
        }

        if (!apAccount) {
            throw new Error("Critical System Error: Failed to find or create 'Accounts Payable' account.");
        }

        // 2. Post Journal Entry
        // Debit Expense (Costs go up)
        // Credit AP (Liability goes up)

        const journalLines = [
            {
                accountId: apAccount.id,
                debitCents: 0,
                creditCents: bill.amountCents // Liability Increase (Credit)
            }
        ];

        for (const line of bill.lines) {
            if (!line.expenseAccountId) continue;
            journalLines.push({
                accountId: line.expenseAccountId,
                debitCents: line.amountCents, // Expense Increase (Debit)
                creditCents: 0
            });
        }

        await LedgerRepo.postJournalEntry({
            tenantId: bill.tenantId,
            date: bill.issueDate,
            description: `Bill ${bill.billNumber} from ${bill.supplier.name}`,
            lines: journalLines
        });

        // 3. Update Status
        await db.update(bills)
            .set({ status: 'APPROVED' })
            .where(eq(bills.id, billId));
    },

    /**
     * Pay Bill: Posts Journal Entry (AP DR, Bank CR)
     */
    async payBill(billId: string, bankAccountId: string, date: string) {
        const bill = await this.getBill(billId);
        if (!bill) throw new Error("Bill not found");
        if (bill.status !== 'APPROVED') throw new Error("Bill must be approved (awaiting payment)");

        // 1. Find AP Account (Debit to reduce liability)
        const apAccount = await db.query.accounts.findFirst({
            where: (a, { eq, and, like }) => and(eq(a.tenantId, bill.tenantId), like(a.name, '%Payable%'))
        });

        if (!apAccount) throw new Error("No AP Account found");

        // 2. Journal Entry
        const entry = await LedgerRepo.postJournalEntry({
            tenantId: bill.tenantId,
            date: date,
            description: `Payment for Bill ${bill.billNumber}`,
            lines: [
                {
                    accountId: apAccount.id,
                    debitCents: bill.amountCents, // Reduce Liability (Debit)
                    creditCents: 0
                },
                {
                    accountId: bankAccountId,
                    debitCents: 0,
                    creditCents: bill.amountCents // Reduce Asset (Credit)
                }
            ]
        });

        // 3. Update Status
        await db.update(bills)
            .set({ status: 'PAID' })
            .where(eq(bills.id, billId));

        return entry;
    }
};
