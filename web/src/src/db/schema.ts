import { pgTable, text, boolean, integer, bigint, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// -----------------------------------------------------------------------------
// Core Multitenancy & Users
// -----------------------------------------------------------------------------

export const tenants = pgTable('tenants', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name'),
    email: text('email').unique().notNull(),
    emailVerified: timestamp('email_verified'),
    image: text('image'),
    passwordHash: text('password_hash'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const memberships = pgTable('memberships', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id),
    tenantId: text('tenant_id').notNull().references(() => tenants.id),
    role: text('role').notNull().default('MEMBER'), // OWNER, MEMBER
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// Existing Tables
// -----------------------------------------------------------------------------

export const accounts = pgTable('accounts', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    showOnDashboard: boolean('show_on_dashboard').default(false).notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    isSystem: boolean('is_system').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const journalEntries = pgTable('journal_entries', {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    date: text('date').notNull(),
    description: text('description').notNull(),
    sourceType: text('source_type'),
    sourceId: text('source_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ledgerLines = pgTable('ledger_lines', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    entryId: text('entry_id').notNull().references(() => journalEntries.id),
    accountId: text('account_id').notNull().references(() => accounts.id),
    date: text('date').notNull(),
    description: text('description'),
    debitCents: bigint('debit_cents', { mode: 'number' }).notNull().default(0),
    creditCents: bigint('credit_cents', { mode: 'number' }).notNull().default(0),
    balanceCents: bigint('balance_cents', { mode: 'number' }).notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// Module: Invoicing
// -----------------------------------------------------------------------------

export const customers = pgTable('customers', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    name: text('name').notNull(),
    email: text('email'),
    address: text('address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    invoiceNumber: text('invoice_number').notNull(), // e.g. INV-1001
    customerId: text('customer_id').notNull().references(() => customers.id),
    issueDate: text('issue_date').notNull(),
    dueDate: text('due_date').notNull(),
    status: text('status').notNull().default('DRAFT'), // DRAFT, SENT, PAID, VOID
    amountCents: integer('amount_cents').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoiceLines = pgTable('invoice_lines', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitPriceCents: integer('unit_price_cents').notNull().default(0),
    amountCents: integer('amount_cents').notNull().default(0), // calculated (qty * price)
    revenueAccountId: text('revenue_account_id').references(() => accounts.id), // Link to GL
});

// -----------------------------------------------------------------------------
// Relations
// -----------------------------------------------------------------------------

export const accountsRelations = relations(accounts, ({ many }) => ({
    lines: many(ledgerLines),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
    lines: many(ledgerLines),
}));

export const ledgerLinesRelations = relations(ledgerLines, ({ one }) => ({
    entry: one(journalEntries, {
        fields: [ledgerLines.entryId],
        references: [journalEntries.id],
    }),
    account: one(accounts, {
        fields: [ledgerLines.accountId],
        references: [accounts.id],
    }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
    invoices: many(invoices),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
    memberships: many(memberships),
}));

export const usersRelations = relations(users, ({ many }) => ({
    memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
    user: one(users, {
        fields: [memberships.userId],
        references: [users.id],
    }),
    tenant: one(tenants, {
        fields: [memberships.tenantId],
        references: [tenants.id],
    }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    customer: one(customers, {
        fields: [invoices.customerId],
        references: [customers.id],
    }),
    lines: many(invoiceLines),
}));

export const invoiceLinesRelations = relations(invoiceLines, ({ one }) => ({
    invoice: one(invoices, {
        fields: [invoiceLines.invoiceId],
        references: [invoices.id],
    }),
    revenueAccount: one(accounts, {
        fields: [invoiceLines.revenueAccountId],
        references: [accounts.id],
    }),
}));

// -----------------------------------------------------------------------------
// Module: Expenses (Accounts Payable)
// -----------------------------------------------------------------------------

export const suppliers = pgTable('suppliers', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    name: text('name').notNull(),
    email: text('email'),
    address: text('address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bills = pgTable('bills', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    billNumber: text('bill_number').notNull(), // e.g. BILL-2024-001
    supplierId: text('supplier_id').notNull().references(() => suppliers.id),
    issueDate: text('issue_date').notNull(),
    dueDate: text('due_date').notNull(),
    status: text('status').notNull().default('DRAFT'), // DRAFT, APPROVED, PAID, VOID
    amountCents: integer('amount_cents').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const billLines = pgTable('bill_lines', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    billId: text('bill_id').notNull().references(() => bills.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitPriceCents: integer('unit_price_cents').notNull().default(0),
    amountCents: integer('amount_cents').notNull().default(0),
    expenseAccountId: text('expense_account_id').references(() => accounts.id), // Link to Expense Account
});

export const suppliersRelations = relations(suppliers, ({ many }) => ({
    bills: many(bills),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
    supplier: one(suppliers, {
        fields: [bills.supplierId],
        references: [suppliers.id],
    }),
    lines: many(billLines),
}));

export const billLinesRelations = relations(billLines, ({ one }) => ({
    bill: one(bills, {
        fields: [billLines.billId],
        references: [bills.id],
    }),
    expenseAccount: one(accounts, {
        fields: [billLines.expenseAccountId],
        references: [accounts.id],
    }),
}));

// -----------------------------------------------------------------------------
// Module: Banking
// -----------------------------------------------------------------------------

export const bankTransactions = pgTable('bank_transactions', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    bankAccountId: text('bank_account_id').notNull().references(() => accounts.id),
    date: text('date').notNull(),
    amountCents: integer('amount_cents').notNull().default(0), // +ve = Deposit, -ve = Withdrawal
    description: text('description').notNull(),
    status: text('status').notNull().default('PENDING'), // PENDING, MATCHED, EXCLUDED
    matchedEntryId: text('matched_entry_id').references(() => journalEntries.id), // If reconciled
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bankTransactionsRelations = relations(bankTransactions, ({ one }) => ({
    bankAccount: one(accounts, {
        fields: [bankTransactions.bankAccountId],
        references: [accounts.id],
    }),
    matchedEntry: one(journalEntries, {
        fields: [bankTransactions.matchedEntryId],
        references: [journalEntries.id],
    }),
}));

export const bankRules = pgTable('bank_rules', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    name: text('name').notNull(), // "Starbucks Rule"
    pattern: text('pattern').notNull(), // "Starbucks"
    targetAccountId: text('target_account_id').notNull().references(() => accounts.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bankRulesRelations = relations(bankRules, ({ one }) => ({
    targetAccount: one(accounts, {
        fields: [bankRules.targetAccountId],
        references: [accounts.id],
    }),
}));
