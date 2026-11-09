export type Contact = {
  id: string; // text form of the database id; no Postgres types here
  name: string;
  company: string;
  notes: string;
  lastContacted: string; // ISO date string, e.g. "2026-10-15"
};
