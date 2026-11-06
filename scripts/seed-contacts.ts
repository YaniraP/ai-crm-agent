import { ObjectId } from "mongodb";
import { closeMongoClient, getDb } from "@/lib/mongodb";
import type { Contact } from "@/types/contact";
import { seedContacts } from "./seed-contacts-data";

type ContactDocument = Omit<Contact, "id"> & { _id: ObjectId };

async function seed(): Promise<void> {
  const db = await getDb();

  // Upsert on the fixed _id: inserts missing contacts, leaves existing ones
  // untouched ($setOnInsert), so re-runs never duplicate or overwrite Atlas edits.
  const result = await db.collection<ContactDocument>("contacts").bulkWrite(
    seedContacts.map(({ id, ...contact }) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $setOnInsert: contact },
        upsert: true,
      },
    })),
  );

  const inserted = result.upsertedCount;
  console.log(
    `Seed complete: ${inserted} inserted, ${seedContacts.length - inserted} already present.`,
  );
}

seed()
  .catch((error: unknown) => {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeMongoClient);
