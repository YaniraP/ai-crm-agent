import { generateFollowUpEmail } from "@/lib/ai";
import type { Contact } from "@/types/contact";

// Fictional sample contact (no database). Email and phone are set on purpose:
// they must NOT influence the message, because ai.ts never sends them.
const sampleContact: Contact = {
  id: "00000000-0000-4000-8000-000000000099",
  name: "Ana García",
  company: "Lumen Logistics",
  notes: "Asked for a demo of the reporting dashboard. Training for the Valencia half marathon.",
  lastContacted: "2026-10-15",
  email: "ana.garcia@example.com",
  phone: "+34 612 345 678",
};

async function main(): Promise<void> {
  const email = await generateFollowUpEmail(sampleContact);
  const wordsBeforeSignature = email.body.split("\n\nBest,")[0].split(/\s+/).length;

  console.log(`Subject: ${email.subject}\n`);
  console.log(email.body);
  console.log(`\n(${wordsBeforeSignature} words before the signature)`);
}

main().catch((error: unknown) => {
  // Only the error name and message: never the request or the key.
  console.error(
    "AI test failed:",
    error instanceof Error ? `${error.name}: ${error.message}` : error,
  );
  process.exitCode = 1;
});
