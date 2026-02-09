import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import "dotenv/config";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === 'production') {
    console.warn("⚠️ DATABASE_URL is missing. Build will continue but database features will fail at runtime.");
}

export const pool = new Pool({
    connectionString: connectionString || "postgres://localhost:5432/placeholder",
});

export const db = drizzle(pool, { schema });
