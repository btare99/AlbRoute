import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// ─── Mongoose connection (for all app API routes) ────────────────────────────
let cached = (global as any).__mongoose_cache;

if (!cached) {
  cached = (global as any).__mongoose_cache = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => {
        console.log('✅ MongoDB connected (mongoose)');
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// ─── Native MongoClient (for NextAuth MongoDBAdapter) ────────────────────────
let client: MongoClient;
let clientPromiseResolved: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In dev, reuse the global client across hot-reloads
  if (!(global as any).__mongo_client_promise) {
    client = new MongoClient(MONGODB_URI);
    (global as any).__mongo_client_promise = client.connect();
  }
  clientPromiseResolved = (global as any).__mongo_client_promise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromiseResolved = client.connect();
}

export { clientPromiseResolved as clientPromise };
export default connectDB;