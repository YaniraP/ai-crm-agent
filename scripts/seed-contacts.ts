import { closeDb, query } from "@/lib/db";
import { seedContacts } from "./seed-contacts-data";

async function seed(): Promise<void> {
  let inserted = 0;

  for (const contact of seedContacts) {
    // Parameterized ($1..$5): values are never pasted into the SQL text.
    // DO NOTHING: existing rows (and your Table Editor edits) are left alone.
    const rows = await query<{ id: string }>(
      `INSERT INTO contacts (id, name, company, notes, last_contacted)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [contact.id, contact.name, contact.company, contact.notes, contact.lastContacted],
    );
    inserted += rows.length;
  }

  console.log(
    `Seed complete: ${inserted} inserted, ${seedContacts.length - inserted} already present.`,
  );
}

seed()
  .catch((error: unknown) => {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDb);
