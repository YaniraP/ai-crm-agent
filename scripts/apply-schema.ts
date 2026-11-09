import { readFile } from "node:fs/promises";
import path from "node:path";
import { closeDb, query } from "@/lib/db";

const schemaPath = path.join(process.cwd(), "db", "schema.sql");

async function applySchema(): Promise<void> {
  const sql = await readFile(schemaPath, "utf8");
  // No parameters, so pg sends it as a simple query (multiple statements allowed).
  await query(sql);
  console.log("Schema applied: db/schema.sql");
}

applySchema()
  .catch((error: unknown) => {
    console.error("Applying schema failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDb);
