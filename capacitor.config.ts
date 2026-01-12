import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pawzr.app',
  appName: 'Pawzr',
  webDir: 'public',
  server: {
    url: 'https://pawzrpro.vercel.app',
    cleartext: true,
    // DO NOT add Google domains here - they must open in system browser for OAuth
    allowNavigation: [
      'https://pawzrpro.vercel.app/*'
    ]
  },
  ios: {
    allowsLinkPreview: false,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false
  },
  plugins: {
    Browser: {
      // Ensure OAuth opens in system browser, not WebView
      presentationStyle: 'popover'
    }
  }
};

export default config;