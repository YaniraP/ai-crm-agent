import { io } from "next/cache";
import { query } from "@/lib/db";
import type { Contact } from "@/types/contact";

// Row shape as returned by Postgres (snake_case). Private to this module.
type ContactRow = {
  id: string; // uuid comes back from pg as a string
  name: string;
  company: string | null;
  notes: string;
  last_contacted: string | null; // cast to text in SQL, e.g. "2026-10-15"
};

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    notes: row.notes,
    lastContacted: row.last_contacted,
  };
}

export async function getContacts(): Promise<Contact[]> {
  // Request-time I/O: keep this out of the prerendered static shell,
  // so edits in the database show up on reload.
  await io();

  try {
    // last_contacted::text avoids pg turning a date into a JS Date at local
    // midnight, which can shift the day when converted back to a string.
    const rows = await query<ContactRow>(
      `SELECT id, name, company, notes, last_contacted::text AS last_contacted
       FROM contacts
       ORDER BY name`,
    );
    return rows.map(toContact);
  } catch (error) {
    throw new Error(
      "Failed to load contacts from the database. Check that it is reachable and that DATABASE_URL is set.",
      { cause: error },
    );
  }
}
