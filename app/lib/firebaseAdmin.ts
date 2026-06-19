import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

if (privateKey) {
  // Strip outer quotes and replace literal \n with actual newlines
  privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
}

let app: any;
let dbInstance: Firestore;
let authInstance: Auth;

function getFirebaseApp() {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApp();
    return app;
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase Admin credentials not fully configured in environment variables. Lazy initialization skipped.');
    return null;
  }

  try {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('🔥 Firebase Admin initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    return null;
  }
}

export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) {
      throw new Error('Firebase Admin SDK is not initialized. Please check your environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
    }
    if (!dbInstance) {
      dbInstance = getFirestore(firebaseApp);
    }
    const value = Reflect.get(dbInstance, prop);
    if (typeof value === 'function') {
      return value.bind(dbInstance);
    }
    return value;
  }
});

export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) {
      throw new Error('Firebase Admin SDK is not initialized. Please check your environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
    }
    if (!authInstance) {
      authInstance = getAuth(firebaseApp);
    }
    const value = Reflect.get(authInstance, prop);
    if (typeof value === 'function') {
      return value.bind(authInstance);
    }
    return value;
  }
});

