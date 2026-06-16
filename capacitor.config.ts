import { CapacitorConfig } from '@capacitor/cli';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Parse .env.local manually to load Google Client ID if available
let googleClientId = process.env.NEXTAUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || '';
try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    // Look for NEXTAUTH_GOOGLE_ID or GOOGLE_CLIENT_ID
    const match = envContent.match(/(?:NEXTAUTH_GOOGLE_ID|GOOGLE_CLIENT_ID)\s*=\s*([^\r\n]+)/);
    if (match) {
      googleClientId = match[1].replace(/['"]/g, '').trim();
    }
  }
} catch (e) {
  console.warn('Could not parse .env.local in capacitor.config.ts:', e);
}

const isProduction = process.env.IS_CAPACITOR === 'true';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '172.20.10.2'; // Fallback
}

const config: CapacitorConfig = {
  appId: 'al.busal.urbani',
  appName: 'Urbani Im',
  webDir: 'out',
  ...(!isProduction ? {
    server: {
      url: `http://${getLocalIP()}:3000`,
      cleartext: true
    }
  } : {}),
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: googleClientId || '534888126742-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
