import 'dotenv/config';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Running manual migration: Add is_archived...');
    try {
        await db.execute(sql`
      ALTER TABLE accounts 
      ADD COLUMN IF NOT EXISTS "is_archived" boolean DEFAULT false NOT NULL;
    `);
        console.log('✅ Migration Successful: Added is_archived column!');
    } catch (err) {
        console.error('❌ Migration Failed:', err);
    }
    process.exit(0);
}

main();
