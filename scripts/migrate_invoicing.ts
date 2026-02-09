import 'dotenv/config';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Running Invoicing Migration...');
    try {
        // 1. Create Customers
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" text PRIMARY KEY NOT NULL,
        "tenant_id" text NOT NULL,
        "name" text NOT NULL,
        "email" text,
        "address" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
        console.log('✅ Created table: customers');

        // 2. Create Invoices
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" text PRIMARY KEY NOT NULL,
        "tenant_id" text NOT NULL,
        "invoice_number" text NOT NULL,
        "customer_id" text NOT NULL REFERENCES "customers"("id"),
        "issue_date" text NOT NULL,
        "due_date" text NOT NULL,
        "status" text DEFAULT 'DRAFT' NOT NULL,
        "amount_cents" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
        console.log('✅ Created table: invoices');

        // 3. Create Invoice Lines
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "invoice_lines" (
        "id" text PRIMARY KEY NOT NULL,
        "invoice_id" text NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
        "description" text NOT NULL,
        "quantity" integer DEFAULT 1 NOT NULL,
        "unit_price_cents" integer DEFAULT 0 NOT NULL,
        "amount_cents" integer DEFAULT 0 NOT NULL,
        "revenue_account_id" text REFERENCES "accounts"("id")
      );
    `);
        console.log('✅ Created table: invoice_lines');

        console.log('🎉 Invoicing Module Database Setup Complete!');
    } catch (err) {
        console.error('❌ Migration Failed:', err);
    }
    process.exit(0);
}

main();
