// scripts/gps-receiver.js
const net = require('net');
const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

console.log('--- starting sinotrack gps tcp receiver ---');

// 1. Manually parse .env.local file to load credentials in standalone Node execution
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index === -1) return;
      const key = trimmed.substring(0, index).trim();
      let value = trimmed.substring(index + 1).trim();
      // Remove double or single quotes wrapping the value
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    });
    console.log('✅ Loaded environment variables from .env.local');
  } else {
    console.log('ℹ️ No .env.local file found. Relying on system environment variables.');
  }
} catch (e) {
  console.warn('⚠️ Could not read .env.local automatically:', e.message);
}

// 2. Extract Firebase Environment Credentials
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

if (privateKey) {
  // Replace escape sequence characters (like literal \n) with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Error: Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in environment.');
  process.exit(1);
}

// 3. Initialize Firebase Admin SDK
try {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    })
  });
  console.log('🔥 Firebase Admin initialized successfully!');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  process.exit(1);
}

const db = getFirestore();

// Port to listen on (SinoTrack standard is 5013 for text/H02 protocol)
const PORT = process.env.GPS_PORT || 5013;

// Helper to convert SinoTrack degree-minute format to decimal degrees
// Example: 4120.3015 -> 41 degrees, 20.3015 minutes -> 41 + (20.3015 / 60) = 41.338358
function parseDegreesMinutes(rawVal) {
  const dotIndex = rawVal.indexOf('.');
  if (dotIndex === -1) return parseFloat(rawVal);
  const degreesStr = rawVal.substring(0, dotIndex - 2);
  const minutesStr = rawVal.substring(dotIndex - 2);
  const degrees = parseFloat(degreesStr || '0');
  const minutes = parseFloat(minutesStr || '0');
  return degrees + (minutes / 60);
}

// Helper to parse standard SinoTrack / H02 protocol message
// Example string: *HQ,9170258631,V1,120535,A,4120.3015,N,01949.2015,E,000.0,000,100626,FFFFFBFF#
function parseSinoTrackMessage(rawMessage) {
  const msg = rawMessage.trim();
  if (!msg.startsWith('*') || !msg.endsWith('#')) {
    return null;
  }
  
  const content = msg.substring(1, msg.length - 1);
  const parts = content.split(',');
  if (parts.length < 12) {
    return null;
  }

  const maker = parts[0];       // e.g. "HQ"
  const trackerId = parts[1];   // Terminal ID / IMEI
  const cmd = parts[2];         // Command (e.g. V1)
  const time = parts[3];        // UTC Time (HHMMSS)
  const validity = parts[4];    // 'A' = Active/Valid, 'V' = Void/Invalid
  
  if (validity !== 'A') {
    console.log(`[GPS] Invalid satellite fix (V) for tracker ${trackerId}`);
    return null;
  }

  // Parse Latitude
  let lat = parseDegreesMinutes(parts[5]);
  if (parts[6] === 'S') lat = -lat;

  // Parse Longitude
  let lng = parseDegreesMinutes(parts[7]);
  if (parts[8] === 'W') lng = -lng;

  // Parse Speed (knots to km/h conversion)
  const speedKnots = parseFloat(parts[9] || '0');
  const speedKmh = Math.round(speedKnots * 1.852);

  // Parse Heading (Direction)
  const heading = parseFloat(parts[10] || '0');

  return {
    trackerId,
    lat,
    lng,
    speed: speedKmh,
    heading,
    timestamp: new Date()
  };
}

// 4. Start TCP Listener
const server = net.createServer((socket) => {
  console.log(`[TCP] Connection established from: ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', async (data) => {
    const rawData = data.toString('utf8');
    console.log(`[TCP] Raw incoming: ${rawData}`);

    // SinoTrack packets usually start with '*' and end with '#'
    const packets = rawData.match(/\*[^*#]+#/g);
    if (!packets) return;

    for (const packet of packets) {
      const gpsData = parseSinoTrackMessage(packet);
      if (!gpsData) continue;

      console.log(`[GPS] Decoded: Tracker ID=${gpsData.trackerId}, Lat=${gpsData.lat}, Lng=${gpsData.lng}, Speed=${gpsData.speed} km/h`);

      try {
        const busRef = db.collection('buses').doc(gpsData.trackerId);
        
        await busRef.set({
          id: gpsData.trackerId,
          lat: gpsData.lat,
          lng: gpsData.lng,
          speed: gpsData.speed,
          heading: gpsData.heading,
          lastUpdate: FieldValue.serverTimestamp(),
          isRealGPS: true,         // Tells AlbRoute to bypass client/server simulation
          status: 'Aktiv'          // Ensure it's active so it is fetched by the app
        }, { merge: true });

        console.log(`[Firestore] Successfully updated bus document ${gpsData.trackerId}`);
      } catch (err) {
        console.error('[Firestore] Error updating bus coordinate:', err);
      }
    }
  });

  socket.on('error', (err) => {
    console.error(`[TCP] Connection error: ${err.message}`);
  });

  socket.on('end', () => {
    console.log('[TCP] Connection closed');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SinoTrack TCP Receiver running on port ${PORT}`);
  console.log(`📡 Point your SinoTrack tracker to this machine's public IP on port ${PORT}`);
});
