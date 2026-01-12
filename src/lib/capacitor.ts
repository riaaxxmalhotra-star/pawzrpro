'use client'

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

let initialized = false

export function initCapacitorApp() {
  if (initialized || !Capacitor.isNativePlatform()) return
  initialized = true

  // Listen for app URL open (deep links)
  App.addListener('appUrlOpen', async ({ url }) => {
    console.log('App opened with URL:', url)

    // Handle OAuth callback from Safari
    if (url.includes('auth/callback') || url.includes('pawzr://')) {
      try {
        await Browser.close()
      } catch (e) {
        // Browser might already be closed
      }
    }

    // Handle custom scheme redirects
    if (url.startsWith('pawzr://')) {
      const path = url.replace('pawzr:/', '')
      if (path && path !== '/') {
        window.location.href = path
      }
    }
  })

  // Listen for back button (Android)
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
    }
  })
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

export function getPlatform(): string {
  return Capacitor.getPlatform()
}

// Open URL in Safari (external browser) - Google accepts this
export async function openInSafari(url: string): Promise<void> {
  await Browser.open({
    url,
    presentationStyle: 'fullscreen',
    toolbarColor: '#ffffff'
  })
}

// Google Sign-In - opens in Safari which Google accepts
export async function nativeGoogleSignIn(): Promise<{ success: boolean; error?: string }> {
  try {
    // Open NextAuth Google sign-in URL in Safari
    // Safari is a real browser, so Google won't block it
    const callbackUrl = encodeURIComponent('https://pawzrpro.vercel.app/dashboard')
    const signInUrl = `https://pawzrpro.vercel.app/api/auth/signin/google?callbackUrl=${callbackUrl}`

    await Browser.open({
      url: signInUrl,
      presentationStyle: 'fullscreen'
    })

    return { success: true }
  } catch (error: any) {
    console.error('Google sign in error:', error)
    return { success: false, error: error.message || 'Sign in failed' }
  }
}

// Apple Sign-In - opens in Safari
export async function nativeAppleSignIn(): Promise<{ success: boolean; error?: string }> {
  try {
    const callbackUrl = encodeURIComponent('https://pawzrpro.vercel.app/dashboard')
    const signInUrl = `https://pawzrpro.vercel.app/api/auth/signin/apple?callbackUrl=${callbackUrl}`

    await Browser.open({
      url: signInUrl,
      presentationStyle: 'fullscreen'
    })

    return { success: true }
  } catch (error: any) {
    console.error('Apple sign in error:', error)
    return { success: false, error: error.message || 'Sign in failed' }
  }
}
