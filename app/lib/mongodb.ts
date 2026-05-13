import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, client: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Lidhja me MongoDB u krye me sukses!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    // Get the MongoDB client from mongoose connection
    if (!cached.client) {
      cached.client = cached.conn.getClient();
    }
  } catch (e) {
    console.error('❌ Gabim gjatë lidhjes me MongoDB:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function getMongoClient() {
  await connectDB();
  return cached.client;
}

export default connectDB;