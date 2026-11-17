-- Optional email and phone, and a non-empty name.
-- DROP ... IF EXISTS before each ADD CONSTRAINT keeps this safe on a fresh
-- database where db/schema.sql already created the same constraints.
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  -- Name is required and cannot be empty or only spaces.
  DROP CONSTRAINT IF EXISTS contacts_name_not_blank,
  ADD  CONSTRAINT contacts_name_not_blank CHECK (btrim(name) <> ''),
  -- Email, when present, is stored trimmed and lowercase (NULL passes a CHECK).
  DROP CONSTRAINT IF EXISTS contacts_email_normalized,
  ADD  CONSTRAINT contacts_email_normalized CHECK (email <> '' AND email = lower(btrim(email))),
  -- Unique when present: UNIQUE treats NULLs as distinct, so many contacts can have no email.
  DROP CONSTRAINT IF EXISTS contacts_email_key,
  ADD  CONSTRAINT contacts_email_key UNIQUE (email);
