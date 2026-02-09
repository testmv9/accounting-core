import { LedgerRepo, CreateAccountParams, PostEntryParams } from "./ledgers";
import { InvoiceRepo, CreateInvoiceParams, CustomerParams } from "./invoices";
import { BillRepo, CreateBillParams, CreateSupplierParams } from "./bills";
import { ReportRepo } from "./reports";
import { BankingRepo, CreateBankTransactionParams } from "./banking";
import { UserRepo } from "./users";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Aggregated Repository
 * Acts as a Facade for all sub-repos to maintain backward compatibility.
 */
export const AccountingRepo = {
    ...LedgerRepo,
    ...InvoiceRepo,
    ...BillRepo,
    ...ReportRepo,
    ...BankingRepo,
    ...UserRepo,

    /**
     * Fix Database Schema (Emergency Migration)
     * Kept here for global access
     */
    async fixDatabaseSchema() {
        // Tenants
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS tenants (
                id text PRIMARY KEY,
                name text NOT NULL,
                slug text UNIQUE NOT NULL,
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);

        // Users
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS users (
                id text PRIMARY KEY,
                name text,
                email text UNIQUE NOT NULL,
                email_verified timestamp,
                image text,
                password_hash text,
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);

        // Memberships
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS memberships (
                id text PRIMARY KEY,
                user_id text NOT NULL REFERENCES users(id),
                tenant_id text NOT NULL REFERENCES tenants(id),
                role text DEFAULT 'MEMBER' NOT NULL,
                is_active boolean DEFAULT true NOT NULL,
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);

        // Suppliers
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS suppliers (
                id text PRIMARY KEY,
                tenant_id text NOT NULL,
                name text NOT NULL,
                email text,
                address text,
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);

        // Bills
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS bills (
                id text PRIMARY KEY,
                tenant_id text NOT NULL,
                bill_number text NOT NULL,
                supplier_id text NOT NULL REFERENCES suppliers(id),
                issue_date text NOT NULL,
                due_date text NOT NULL,
                status text DEFAULT 'DRAFT' NOT NULL,
                amount_cents integer DEFAULT 0 NOT NULL,
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);

        // Bill Lines
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS bill_lines (
                id text PRIMARY KEY,
                bill_id text NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
                description text NOT NULL,
                quantity integer DEFAULT 1 NOT NULL,
                unit_price_cents integer DEFAULT 0 NOT NULL,
                amount_cents integer DEFAULT 0 NOT NULL,
                expense_account_id text REFERENCES accounts(id)
            );
        `);

        // Bank Transactions
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS bank_transactions (
                id text PRIMARY KEY,
                tenant_id text NOT NULL,
                bank_account_id text NOT NULL REFERENCES accounts(id),
                date text NOT NULL,
                amount_cents integer DEFAULT 0 NOT NULL,
                description text NOT NULL,
                status text DEFAULT 'PENDING' NOT NULL,
                matched_entry_id text REFERENCES journal_entries(id),
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);

        // Bank Rules
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS bank_rules (
                id text PRIMARY KEY,
                tenant_id text NOT NULL,
                name text NOT NULL,
                pattern text NOT NULL,
                target_account_id text NOT NULL REFERENCES accounts(id),
                created_at timestamp DEFAULT now() NOT NULL
            );
        `);
    }
};

// Re-export types for consumers
export type { CreateAccountParams, PostEntryParams };
export type { CreateInvoiceParams, CustomerParams };
export type { CreateBillParams, CreateSupplierParams };
export type { CreateBankTransactionParams };
