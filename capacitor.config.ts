import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'pawzrpro',
  webDir: 'public',
  server: {
    url: 'https://pawzrpro.vercel.app',
    cleartext: true
  }
};

export default config;