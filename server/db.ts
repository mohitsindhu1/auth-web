import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use the provided PostgreSQL URL if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZNHf7uDlkF4S@ep-bitter-truth-a8glqli4-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });