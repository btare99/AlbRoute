import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

if (privateKey) {
  // Strip outer quotes and replace literal \n with actual newlines
  privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
}

let app;
if (getApps().length === 0) {
  try {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('🔥 Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw error;
  }
} else {
  app = getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);

