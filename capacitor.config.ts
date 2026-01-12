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
  plugins: {
    SocialLogin: {
      google: {
        iOSClientId: '1094158533320-7fugh8bijpp1770uo21b0ubf8f36odp1.apps.googleusercontent.com',
        iOSServerClientId: '1094158533320-aumh0qgrr06o0o17umlulthgj3m72dlq.apps.googleusercontent.com'
      }
    }
  }
};

export default config;