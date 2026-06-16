const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

let privateKey = env.FIREBASE_PRIVATE_KEY || '';
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});
const db = getFirestore(app);

async function checkUsers() {
  const snapshot = await db.collection('users').get();
  console.log('Total users:', snapshot.size);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('---');
    console.log('ID:', doc.id);
    console.log('Email:', data.email);
    console.log('Name:', data.name);
    console.log('Has password:', !!data.password);
    console.log('Password hash (first 20):', data.password ? data.password.substring(0, 20) + '...' : 'NONE');
    console.log('isEmailVerified:', data.isEmailVerified);
    console.log('lastLogin:', data.lastLogin);
  });
}
checkUsers().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
