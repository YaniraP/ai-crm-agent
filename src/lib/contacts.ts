import { connection } from "next/server";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { Contact } from "@/types/contact";

// Shape stored in MongoDB. Stays private to this module.
type ContactDocument = Omit<Contact, "id"> & { _id: ObjectId };

export async function getContacts(): Promise<Contact[]> {
  // Read at request time (never cached into the static shell),
  // so edits made in Atlas show up on reload.
  await connection();

  try {
    const db = await getDb();
    const docs = await db
      .collection<ContactDocument>("contacts")
      .find()
      .sort({ name: 1 })
      .toArray();

    return docs.map((doc) => ({
      id: doc._id.toHexString(),
      name: doc.name,
      company: doc.company,
      notes: doc.notes,
      lastContacted: doc.lastContacted,
    }));
  } catch (error) {
    throw new Error(
      "Failed to load contacts from MongoDB. Check that the database is reachable and that MONGODB_URI and MONGODB_DB are set.",
      { cause: error },
    );
  }
}
