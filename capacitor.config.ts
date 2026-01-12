import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pawzr.app',
  appName: 'Pawzr',
  webDir: 'public',
  server: {
    url: 'https://pawzrpro.vercel.app',
    cleartext: true,
    // Only allow navigation to our domain - external URLs open in Safari
    allowNavigation: [
      'pawzrpro.vercel.app'
    ]
  },
  ios: {
    allowsLinkPreview: false,
    scrollEnabled: true
  }
};

export default config;