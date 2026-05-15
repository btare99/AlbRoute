import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables.');
}

// Global cache to prevent multiple connections during hot-reload in dev
declare global {
  var _mongooseConn: typeof mongoose | null;
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

global._mongooseConn = global._mongooseConn ?? null;
global._mongoosePromise = global._mongoosePromise ?? null;

async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConn) {
    return global._mongooseConn;
  }

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  global._mongooseConn = await global._mongoosePromise;
  return global._mongooseConn;
}

export default connectDB;