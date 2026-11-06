export type Contact = {
  id: string; // string form of the database id; no MongoDB types here
  name: string;
  company: string;
  notes: string;
  lastContacted: string; // ISO date string, e.g. "2026-10-15"
};
