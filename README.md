# ai-crm-agent

A small CRM for managing contacts, built as a learning project on the way to AI and automation work. The next steps add AI-generated follow-up messages and an assistant that can query the contacts on its own.

## Features

- Add, edit and delete contacts (delete asks for confirmation)
- Search by name or company, matching the start of words and ignoring capital letters
- Validation in the app and in the database: required name, unique email (stored in lowercase), phone format

## Tech stack

- Next.js 16 (App Router, Server Actions) and TypeScript
- Postgres hosted on Supabase, used through the standard connection string with `pg` (plain SQL, no ORM)
- A small migration script of its own, with no extra dependencies

## Getting started

1. `npm install`
2. Set up the database (see below)
3. `npm run dev` and open http://localhost:3000

## Database setup

1. Create `.env.local` in the project root with `DATABASE_URL=<your Postgres connection string>`. This file is ignored by Git.
2. Create the table: `npm run db:schema`
3. Apply pending migrations: `npm run db:migrate`
4. Load sample contacts (optional): `npm run seed:contacts`

Migrations live in `db/migrations/` as numbered SQL files. `npm run db:migrate` applies only the ones not yet recorded in the `schema_migrations` table, in order, each in its own transaction. Applied migrations are never edited; changes go in a new numbered file.

## Known limitations

These are deliberate trade-offs for a single-user learning project:

- **Native browser dialogs.** Confirmations and notices use the browser's built-in dialogs (`confirm` before deleting, `alert` when a contact no longer exists). They are simple and reliable, but not styled.
- **Hard delete.** Deleting a contact removes it permanently, after a confirmation. A production CRM would usually use soft delete so contacts can be restored.
- **Last write wins.** If the same contact is edited in two tabs, the last save overwrites the other.
- **Search doesn't ignore accents.** "garcia" doesn't find "García".
- **No authentication.** The app is meant to run locally. It must not be deployed publicly without adding login first.