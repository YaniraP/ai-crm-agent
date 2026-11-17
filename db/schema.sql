-- Contacts table. Safe to run repeatedly (npm run db:schema).
-- gen_random_uuid() is built into Postgres 13+, so this is not provider-specific.
-- Keep in sync with db/migrations/ (latest: 003).
CREATE TABLE IF NOT EXISTS contacts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL, -- not unique: names can repeat
  company        text, -- optional (NULL allowed)
  notes          text NOT NULL DEFAULT '',
  last_contacted date, -- optional (NULL allowed)
  email          text, -- optional; unique, trimmed and lowercase when present
  phone          text, -- optional
  CONSTRAINT contacts_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT contacts_email_normalized CHECK (email <> '' AND email = lower(btrim(email))),
  CONSTRAINT contacts_email_key UNIQUE (email),
  CONSTRAINT contacts_phone_format CHECK (
    phone ~ '^[0-9 +()-]+$'                                   -- only allowed characters
    AND length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 6 -- at least 6 digits
  )
);
