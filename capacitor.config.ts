import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'al.busal.urbani',
  appName: 'Urbani Im',
  webDir: 'out',
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
  },
};

export default config;
