-- Contacts table. Safe to run repeatedly (npm run db:schema).
-- gen_random_uuid() is built into Postgres 13+, so this is not provider-specific.
CREATE TABLE IF NOT EXISTS contacts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL, -- not unique: names can repeat
  company        text NOT NULL,
  notes          text NOT NULL DEFAULT '',
  last_contacted date NOT NULL
);
