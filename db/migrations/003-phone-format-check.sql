-- Phone, when present: only digits, spaces, +, - and ( ), with at least 6 digits.
-- NULL passes a CHECK, so contacts without a phone are fine.
-- DROP ... IF EXISTS keeps this safe where db/schema.sql already created it.
ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_phone_format,
  ADD  CONSTRAINT contacts_phone_format CHECK (
    phone ~ '^[0-9 +()-]+$'                                   -- only allowed characters
    AND length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 6 -- at least 6 digits
  );
