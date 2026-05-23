import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'clothing-ecommerce',
  webDir: 'public',
  server: {
    url: process.env.CAPACITOR_DEV_SERVER_URL ?? 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
