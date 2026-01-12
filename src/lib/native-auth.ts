'use client'

import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

// Check if running in native app
export const isNativeApp = () => {
  return Capacitor.isNativePlatform()
}

// Get the base URL for auth
export const getAuthBaseUrl = () => {
  // In native app, use the production URL for OAuth callbacks
  if (isNativeApp()) {
    return 'https://pawzrpro.vercel.app'
  }
  // In browser, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

// Open OAuth in external browser for native apps
export const openOAuthInBrowser = async (provider: string, callbackUrl: string = '/dashboard') => {
  const baseUrl = getAuthBaseUrl()
  const encodedCallback = encodeURIComponent(`${baseUrl}${callbackUrl}`)
  const authUrl = `${baseUrl}/api/auth/signin/${provider}?callbackUrl=${encodedCallback}`

  if (isNativeApp()) {
    // Open in external browser (Safari) for proper OAuth flow
    await Browser.open({
      url: authUrl,
      presentationStyle: 'popover'
    })

    // Listen for the app to come back to foreground
    // The user will be redirected back after OAuth completes
    return true
  } else {
    // In browser, just redirect
    window.location.href = authUrl
    return true
  }
}

// Close the browser (call after OAuth callback)
export const closeBrowser = async () => {
  if (isNativeApp()) {
    try {
      await Browser.close()
    } catch (e) {
      // Browser might already be closed
      console.log('Browser already closed')
    }
  }
}
