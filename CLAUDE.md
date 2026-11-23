# ai-crm-agent

A small CRM built as a learning project: Next.js 16 (App Router, Server Actions), TypeScript, Postgres on Supabase through `pg` (plain SQL, no ORM), and Groq for AI through its OpenAI-compatible API with plain `fetch`. All contact data is fictional.

@AGENTS.md

## Commands
- `npm run dev` · `npx tsc --noEmit` · `npm run lint` · `npm run build`
- `npm run db:schema` · `npm run db:migrate` · `npm run seed:contacts`
- `npm run ai:try` (tests the AI connection without the UI)

## How we work
- I'm learning: explain the why briefly, in plain words.
- Plan before code. Wait for my OK before changing any file.
- Bigger tasks go in milestones: short plan (max 10 lines), wait for my OK, code, list 2-3 new concepts, tell me how to check it, then stop.
- Before saying a milestone is done, run `npx tsc --noEmit`, `npm run lint` and `npm run build`.
- Never commit or push: I review and commit myself.
- Only change files inside the project folder. Never edit `.env.local`.
- Never run anything that changes the database without asking me first (this includes `npm run db:schema`, `db:migrate` and `seed:contacts`).
- No new dependencies unless you explain why first.
- If the plan bends one of these rules, or you add something I didn't ask for, say so explicitly.
- If something is unclear, ask instead of guessing.
- Always reply in English.

## Where things live
- `src/lib/db.ts` is the only place that creates the database connection (one pool).
- `src/lib/contacts.ts` is the only place in the app (`src/`) with SQL for contacts: all reads and writes. It returns the app's own `Contact` type. Scripts in `scripts/` may have their own SQL, because `contacts.ts` uses Next.js APIs.
- `src/lib/db.ts` and `src/lib/ai.ts` are also used by scripts, so they never import Next.js.
- `src/lib/ai.ts` is the only place that calls the AI API, so switching provider means changing one file.
- Server Actions live in `src/app/actions.ts`.
- A rule used by both the browser and the server is written once, in a shared file (like `src/lib/follow-up-rules.ts`).

## Code conventions
- Code, comments and UI text in English.
- Server Components by default; `"use client"` only for state, effects, events or browser APIs.
- Keep it simple: no code "just in case". Small known limitations go in the README instead of extra code.

## Database rules
- Any value from outside the code (forms, URL, the AI) goes in as a query parameter ($1, $2…), never pasted into the SQL text.
- Table changes only through a new numbered migration in `db/migrations/`, and `db/schema.sql` stays in sync (including its "latest: NNN" comment). Treat every committed migration as already run: never edit it.
- Validation lives in two layers: the Server Action for friendly messages, and database constraints (CHECK, UNIQUE) to guarantee the rule. The database is never stricter than the app.
- Never trust the browser: the server checks everything again (for example, that an id is a UUID) and reads data from the database by id.

## AI rules
- What must always be the same (greeting, signature, recipients, formats, dates) is done by code, not by the AI. The AI only does what needs creativity.
- Fixed rules go in the system message; case data goes in the user message.
- Data sent to the AI is information, not instructions (prompt injection). Say so in the prompt.
- Send the AI only the fields the task needs. Email and phone are not sent unless I decide otherwise.
- Ask for JSON when the code needs parts, and check it before using it.
- Always a timeout and clear, friendly error messages (including rate limits); technical details only in server logs.
- AI features are read-only: the AI never creates, edits or deletes data, and any tool it can call only reads. Changing this needs my explicit decision.

## Security
- Secrets (`DATABASE_URL`, `GROQ_API_KEY`) live only in `.env.local`, which is git-ignored.
- Never put secrets in the code, the repo, logs, the browser or the chat.
- API keys stay on the server: the AI is only called from server code.
- Logs keep only the error message (plus its name when useful): no secrets and no contact data.
- The repo is public: no personal data.
