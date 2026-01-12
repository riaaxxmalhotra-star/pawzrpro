import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pawzr.app',
  appName: 'Pawzr',
  webDir: 'public',
  server: {
    url: 'https://pawzrpro.vercel.app',
    cleartext: true
  },
  ios: {
    allowsLinkPreview: false,
    scrollEnabled: true
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1094158533320-aumh0qgrr06o0o17umlulthgj3m72dlq.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;