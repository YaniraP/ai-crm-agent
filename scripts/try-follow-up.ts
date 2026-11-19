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
  // Only the AI's part: between the greeting line and the signature.
  const aiText = email.body.split("\n\nBest,")[0].split("\n\n").slice(1).join(" ");
  const aiWords = aiText.split(/\s+/).filter(Boolean).length;

  console.log(`Subject: ${email.subject}\n`);
  console.log(email.body);
  console.log(`\n(${aiWords} words written by the AI, between greeting and signature)`);
}

main().catch((error: unknown) => {
  // Only the error name and message: never the request or the key.
  console.error(
    "AI test failed:",
    error instanceof Error ? `${error.name}: ${error.message}` : error,
  );
  process.exitCode = 1;
});
