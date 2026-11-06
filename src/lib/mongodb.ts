import { MongoClient, type Db } from "mongodb";

function requireEnv(name: "MONGODB_URI" | "MONGODB_DB"): string {
  const value = process.env[name];
  if (!value) {
    // Names the variable only, never its value.
    throw new Error(`Missing environment variable ${name}. Define it in .env.local.`);
  }
  return value;
}

// Cache the client on globalThis so dev hot reloads reuse one connection.
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(requireEnv("MONGODB_URI"), {
      serverSelectionTimeoutMS: 5000, // fail fast instead of hanging ~30s
    });
    globalForMongo._mongoClientPromise = client.connect().catch((err) => {
      globalForMongo._mongoClientPromise = undefined; // allow a later retry
      throw err;
    });
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(requireEnv("MONGODB_DB"));
}

// Used by scripts (e.g. the seed) so the Node process can exit.
export async function closeMongoClient(): Promise<void> {
  const pending = globalForMongo._mongoClientPromise;
  globalForMongo._mongoClientPromise = undefined;
  const client = await pending?.catch(() => undefined);
  await client?.close();
}
