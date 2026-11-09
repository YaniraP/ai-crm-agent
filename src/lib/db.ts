import { Pool, type QueryResultRow } from "pg";

// The only place that connects to Postgres. Used by the app and by scripts,
// so it must not import anything from Next.js.

function requireEnv(name: "DATABASE_URL"): string {
  const value = process.env[name];
  if (!value) {
    // Names the variable only, never its value.
    throw new Error(`Missing environment variable ${name}. Define it in .env.local.`);
  }
  return value;
}

// Keep one pool on globalThis so dev hot reloads don't open new connections.
const globalForDb = globalThis as typeof globalThis & { _pgPool?: Pool };

function getPool(): Pool {
  if (!globalForDb._pgPool) {
    globalForDb._pgPool = new Pool({
      connectionString: requireEnv("DATABASE_URL"),
      max: 5, // the Supabase session pooler allows few client connections
      connectionTimeoutMillis: 5000, // fail fast instead of hanging
    });
  }
  return globalForDb._pgPool;
}

export async function query<Row extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<Row[]> {
  const result = await getPool().query<Row>(sql, params);
  return result.rows;
}

// Used by scripts so the Node process can exit.
export async function closeDb(): Promise<void> {
  const pool = globalForDb._pgPool;
  globalForDb._pgPool = undefined;
  await pool?.end();
}
