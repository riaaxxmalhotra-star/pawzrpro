import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pawzr.app',
  appName: 'Pawzr',
  webDir: 'public',
  server: {
    url: 'https://pawzrpro.vercel.app',
    cleartext: true,
    // Open Google OAuth in external browser (Safari) instead of WebView
    allowNavigation: ['pawzrpro.vercel.app']
  },
  ios: {
    allowsLinkPreview: false,
    scrollEnabled: true
  },
  plugins: {}
};

export default config;