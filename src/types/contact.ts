export type Contact = {
  id: string; // text form of the database id; no Postgres types here
  name: string;
  notes: string;
  lastContacted: string | null; // ISO date string, e.g. "2026-10-15" - null is never contacted
  company: string | null;
};
