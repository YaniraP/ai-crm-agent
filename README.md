# ai-crm-agent

A small CRM for managing contacts, built as a learning project on the way to AI and automation work. It can write a personal follow-up email for any contact with AI. The next step adds an assistant that can query the contacts on its own.


## Features

- Add, edit and delete contacts (delete asks for confirmation)
- Search by name or company, matching the start of words and ignoring capital letters
- Validation in the app and in the database: required name, unique email (stored in lowercase), phone format
- **AI follow-up email:** one click writes a short, friendly email based on the contact's notes. Copy it, generate another, or open it as a draft in your email app or in Gmail. Nothing is sent automatically.


## How the AI feature works

- All AI calls live in one file, `src/lib/ai.ts`, using the OpenAI-compatible API with plain `fetch` (no SDK). Changing the provider means changing one file.
- Only the contact's name, company, notes and days since the last contact are sent to the AI. Email and phone never are.
- A contact needs notes to get a follow-up email. Both the page and the server check it, so the AI is never called without information to work with.
- The rules (tone, length, no selling, no invented facts) go in the system message and the contact data in the user message. The AI is told to treat the data as information, not instructions.
- Anything that must always be the same is done in code, not by the AI: the greeting, the signature, and the recipient, which comes from the database. The code also removes a greeting if the AI adds one anyway.
- The API key stays on the server: it never reaches the browser.

## Tech stack

- Next.js 16 (App Router, Server Actions) and TypeScript
- Postgres hosted on Supabase, used through the standard connection string with `pg` (plain SQL, no ORM)
- Groq for the AI (model `openai/gpt-oss-20b`), through its OpenAI-compatible API
- A small migration script of its own, with no extra dependencies

## Getting started

1. `npm install`
2. Create `.env.local` in the project root (it's ignored by Git) with:
   - `DATABASE_URL=<your Postgres connection string>`
   - `GROQ_API_KEY=<your Groq API key>` (create one at console.groq.com → API Keys)
3. Set up the database (see below)
4. Check the AI connection: `npm run ai:try` prints a follow-up email for a sample contact
5. `npm run dev` and open http://localhost:3000

## Database setup

1. Create the table: `npm run db:schema`
2. Apply pending migrations: `npm run db:migrate`
3. Load sample contacts (optional): `npm run seed:contacts`

Migrations live in `db/migrations/` as numbered SQL files. `npm run db:migrate` applies only the ones not yet recorded in the `schema_migrations` table, in order, each in its own transaction. Applied migrations are never edited; changes go in a new numbered file.

## Known limitations

These are deliberate trade-offs for a single-user learning project:

- **AI output can slip.** The prompt rules (tone, no selling, no assumptions) usually hold but aren't guaranteed. Every draft is reviewed by a person before sending; nothing is sent automatically.
- **AI rate limits.** Groq's free plan limits the number of requests; when the limit is reached, the app asks you to wait a minute.
- **"Open in email app" needs a default email app** on the computer. "Open in Gmail" works without one.
- **Native browser dialogs.** Confirmations and notices use the browser's built-in dialogs (`confirm` before deleting, `alert` when a contact no longer exists). They are simple and reliable, but not styled.
- **Hard delete.** Deleting a contact removes it permanently, after a confirmation. A production CRM would usually use soft delete so contacts can be restored.
- **Last write wins.** If the same contact is edited in two tabs, the last save overwrites the other.
- **Search doesn't ignore accents.** "garcia" doesn't find "García".
- **No authentication.** The app is meant to run locally. It must not be deployed publicly without adding login first.
- **Fictional data only.** The sample contacts are invented. Real people's data would need a provider and setup that meet GDPR.