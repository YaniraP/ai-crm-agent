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
  email: string | null;
  phone: string | null;
};

// Columns returned to the app, in the same shape as ContactRow.
// last_contacted::text avoids pg turning a date into a JS Date at local
// midnight, which can shift the day when converted back to a string.
const CONTACT_COLUMNS =
  "id, name, company, notes, last_contacted::text AS last_contacted, email, phone";

// Input to create or update a contact, already cleaned by the caller.
// null means "empty": nullable columns store NULL, notes uses its DEFAULT.
export type ContactInput = {
  name: string;
  company: string | null;
  email: string | null; // already trimmed and lowercase
  phone: string | null;
  lastContacted: string | null; // "YYYY-MM-DD"
  notes: string | null;
};

// Thrown when the email is already used by another contact.
export class DuplicateEmailError extends Error {
  constructor() {
    super("This email is already in use.");
    this.name = "DuplicateEmailError";
  }
}

// Postgres error 23505 = unique_violation; pg also reports which constraint failed.
function isUniqueViolation(error: unknown, constraint: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505" &&
    "constraint" in error &&
    error.constraint === constraint
  );
}

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    notes: row.notes,
    lastContacted: row.last_contacted,
    email: row.email,
    phone: row.phone,
  };
}

export async function getContacts(): Promise<Contact[]> {
  // Request-time I/O: keep this out of the prerendered static shell,
  // so edits in the database show up on reload.
  await io();

  try {
    const rows = await query<ContactRow>(
      `SELECT ${CONTACT_COLUMNS}
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

// Every value goes in as a $n parameter. The only text chosen by code is the
// keyword DEFAULT for empty notes (the column is NOT NULL DEFAULT '').
// Returns the SQL to use for notes: "DEFAULT" or the next "$n".
function notesSql(params: unknown[], notes: string | null): string {
  if (notes === null) return "DEFAULT";
  params.push(notes);
  return `$${params.length}`;
}

// Turns a duplicate-email error from Postgres into DuplicateEmailError.
function toAppError(error: unknown): unknown {
  return isUniqueViolation(error, "contacts_email_key") ? new DuplicateEmailError() : error;
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const params: unknown[] = [
    input.name,
    input.company,
    input.email,
    input.phone,
    input.lastContacted,
  ];
  const notesValue = notesSql(params, input.notes);

  try {
    const rows = await query<ContactRow>(
      `INSERT INTO contacts (name, company, email, phone, last_contacted, notes)
       VALUES ($1, $2, $3, $4, $5, ${notesValue})
       RETURNING ${CONTACT_COLUMNS}`,
      params,
    );
    return toContact(rows[0]);
  } catch (error) {
    throw toAppError(error);
  }
}

// Returns the updated contact, or null if no contact had that id.
export async function updateContact(id: string, input: ContactInput): Promise<Contact | null> {
  const params: unknown[] = [
    id,
    input.name,
    input.company,
    input.email,
    input.phone,
    input.lastContacted,
  ];
  const notesValue = notesSql(params, input.notes);

  try {
    const rows = await query<ContactRow>(
      `UPDATE contacts
       SET name = $2, company = $3, email = $4, phone = $5, last_contacted = $6,
           notes = ${notesValue}
       WHERE id = $1
       RETURNING ${CONTACT_COLUMNS}`,
      params,
    );
    return rows.length > 0 ? toContact(rows[0]) : null;
  } catch (error) {
    throw toAppError(error);
  }
}

// Returns true if a contact was deleted, false if no contact had that id.
export async function deleteContact(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "DELETE FROM contacts WHERE id = $1 RETURNING id",
    [id],
  );
  return rows.length > 0;
}
