import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { closeDb, query, withTransaction } from "@/lib/db";

const migrationsDir = path.join(process.cwd(), "db", "migrations");
// e.g. 001-optional-contact-fields.sql -> number 1
const FILE_PATTERN = /^(\d+)-[\w-]+\.sql$/;

type Migration = { name: string; number: number };

async function listMigrations(): Promise<Migration[]> {
  const migrations: Migration[] = [];
  for (const name of await readdir(migrationsDir)) {
    const match = FILE_PATTERN.exec(name);
    if (match) migrations.push({ name, number: Number(match[1]) });
  }
  return migrations.sort((a, b) => a.number - b.number);
}

async function migrate(): Promise<void> {
  // The database remembers which migrations already ran.
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

  const migrations = await listMigrations();
  const appliedRows = await query<{ name: string }>("SELECT name FROM schema_migrations");
  const applied = new Set(appliedRows.map((row) => row.name));
  const pending = migrations.filter((m) => !applied.has(m.name));

  for (const migration of pending) {
    const sql = await readFile(path.join(migrationsDir, migration.name), "utf8");
    // Run the file and record it together: both happen, or neither does.
    await withTransaction(async (client) => {
      await client.query(sql); // no params, so multiple statements are allowed
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [migration.name]);
    });
    console.log(`Applied ${migration.name}`);
  }

  console.log(
    `Migrations complete: ${pending.length} applied, ${migrations.length - pending.length} already applied.`,
  );
}

migrate()
  .catch((error: unknown) => {
    console.error("Migration failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDb);
