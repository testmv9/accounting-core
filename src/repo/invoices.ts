import { db } from "../db";
import { customers, invoices, invoiceLines } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { LedgerRepo } from "./ledgers";

export type CustomerParams = {
    tenantId: string;
    name: string;
    email?: string;
    address?: string;
};

export type CreateInvoiceParams = {
    tenantId: string;
    customerId: string;
    issueDate: string;
    dueDate: string;
    lines: {
        description: string;
        quantity: number;
        unitPriceCents: number;
        revenueAccountId: string;
        amountCents?: number; // Calculated inside
    }[];
};

export const InvoiceRepo = {
    /**
     * Create Customer
     */
    async createCustomer(params: CustomerParams) {
        const [customer] = await db.insert(customers).values({
            id: createId(),
            tenantId: params.tenantId,
            name: params.name,
            email: params.email ?? null,
            address: params.address ?? null
        }).returning();
        return customer;
    },

    /**
     * List Customers
     */
    async listCustomers(tenantId: string) {
        return db.select().from(customers).where(eq(customers.tenantId, tenantId));
    },

    /**
     * Create Invoice Header & Lines
     */
    async createInvoice(params: CreateInvoiceParams) {
        return await db.transaction(async (tx) => {
            // 1. Calculate Total
            let totalCents = 0;
            const linesData = params.lines.map(l => {
                const lineTotal = l.quantity * l.unitPriceCents;
                totalCents += lineTotal;
                return { ...l, amountCents: lineTotal };
            });

            // 2. Insert Invoice Header
            const invoiceId = createId();
            const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

            const [invoice] = await tx.insert(invoices).values({
                id: invoiceId,
                tenantId: params.tenantId,
                invoiceNumber: invoiceNumber,
                customerId: params.customerId,
                issueDate: params.issueDate,
                dueDate: params.dueDate,
                status: 'DRAFT',
                amountCents: totalCents
            }).returning();

            // 3. Insert Lines
            for (const line of linesData) {
                await tx.insert(invoiceLines).values({
                    id: createId(),
                    invoiceId: invoiceId,
                    description: line.description,
                    quantity: line.quantity,
                    unitPriceCents: line.unitPriceCents,
                    amountCents: line.amountCents,
                    revenueAccountId: line.revenueAccountId
                });
            }

            return invoice;
        });
    },

    async getInvoice(invoiceId: string) {
        return await db.query.invoices.findFirst({
            where: (model, { eq }) => eq(model.id, invoiceId),
            with: {
                customer: true,
                lines: {
                    with: {
                        revenueAccount: true
                    }
                }
            }
        });
    },

    async listInvoices(tenantId: string) {
        return await db.query.invoices.findMany({
            where: (model, { eq }) => eq(model.tenantId, tenantId),
            with: {
                customer: true
            },
            orderBy: (model, { desc }) => desc(model.issueDate)
        });
    },

    /**
     * Approve Invoice: Locks it and Posts Journal Entry
     */
    async approveInvoice(invoiceId: string) {
        const invoice = await this.getInvoice(invoiceId);
        if (!invoice) throw new Error("Invoice not found");
        if (invoice.status !== 'DRAFT') throw new Error("Only drafts can be approved");

        // 1. Find AR Account
        const arAccount = await db.query.accounts.findFirst({
            where: (a, { eq, and, like }) => and(eq(a.tenantId, invoice.tenantId), like(a.name, '%Receivable%'))
        });

        if (!arAccount) {
            throw new Error("System Configuration Error: No 'Accounts Receivable' account found. Please create one.");
        }

        // 2. Post Journal Entry
        // Debit AR (Asset increases)
        // Credit Sales (Revenue increases)
        const journalLines = [
            {
                accountId: arAccount.id,
                debitCents: invoice.amountCents,
                creditCents: 0
            }
        ];

        for (const line of invoice.lines) {
            if (!line.revenueAccountId) continue;
            journalLines.push({
                accountId: line.revenueAccountId,
                debitCents: 0,
                creditCents: line.amountCents
            });
        }

        await LedgerRepo.postJournalEntry({
            tenantId: invoice.tenantId,
            date: invoice.issueDate,
            description: `Invoice ${invoice.invoiceNumber} - ${invoice.customer.name}`,
            lines: journalLines
        });

        // 3. Update Invoice Status
        await db.update(invoices)
            .set({ status: 'AWAITING_PAYMENT' })
            .where(eq(invoices.id, invoiceId));
    },

    /**
     * Record Payment for an Invoice
     */
    async payInvoice(invoiceId: string, bankAccountId: string, date: string) {
        const invoice = await this.getInvoice(invoiceId);
        if (!invoice) throw new Error("Invoice not found");
        if (invoice.status !== 'AWAITING_PAYMENT') throw new Error("Invoice must be awaiting payment");

        // 1. Find AR Account
        const arAccount = await db.query.accounts.findFirst({
            where: (a, { eq, and, like }) => and(eq(a.tenantId, invoice.tenantId), like(a.name, '%Receivable%'))
        });

        if (!arAccount) {
            throw new Error("System Configuration Error: No 'Accounts Receivable' account found.");
        }

        // 2. Post Journal Entry
        const entry = await LedgerRepo.postJournalEntry({
            tenantId: invoice.tenantId,
            date: date,
            description: `Payment for Invoice ${invoice.invoiceNumber}`,
            lines: [
                {
                    accountId: bankAccountId,
                    debitCents: invoice.amountCents,
                    creditCents: 0
                },
                {
                    accountId: arAccount.id,
                    debitCents: 0,
                    creditCents: invoice.amountCents
                }
            ]
        });

        // 3. Update Status
        await db.update(invoices)
            .set({ status: 'PAID' })
            .where(eq(invoices.id, invoiceId));

        return entry;
    },

    /**
     * Void Invoice
     */
    async voidInvoice(invoiceId: string) {
        const invoice = await this.getInvoice(invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        if (invoice.status === 'PAID') {
            throw new Error("Cannot void a PAID invoice. Please delete the payment first.");
        }

        if (invoice.status === 'VOID') {
            return;
        }

        if (invoice.status === 'AWAITING_PAYMENT' || invoice.status === 'SENT') {
            // 1. Find AR Account
            const arAccount = await db.query.accounts.findFirst({
                where: (a, { eq, and, like }) => and(eq(a.tenantId, invoice.tenantId), like(a.name, '%Receivable%'))
            });

            if (!arAccount) {
                throw new Error("System Configuration Error: No 'Accounts Receivable' account found to reverse.");
            }

            // 2. Create Reversing Journal
            const journalLines = [
                {
                    accountId: arAccount.id,
                    debitCents: 0,
                    creditCents: invoice.amountCents
                }
            ];

            for (const line of invoice.lines) {
                if (!line.revenueAccountId) continue;
                journalLines.push({
                    accountId: line.revenueAccountId,
                    debitCents: line.amountCents,
                    creditCents: 0
                });
            }

            await LedgerRepo.postJournalEntry({
                tenantId: invoice.tenantId,
                date: new Date().toISOString().split('T')[0] || "",
                description: `VOID Invoice ${invoice.invoiceNumber}`,
                lines: journalLines
            });
        }

        // 3. Update Status
        await db.update(invoices)
            .set({ status: 'VOID' })
            .where(eq(invoices.id, invoiceId));
    }
};
