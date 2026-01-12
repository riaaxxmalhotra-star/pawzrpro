'use client'

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'

let initialized = false
let googleAuthInitialized = false
let authCallbackHandler: ((token: string, userId: string) => void) | null = null

export function initCapacitorApp() {
  if (initialized || !Capacitor.isNativePlatform()) return
  initialized = true

  // Listen for app URL open (deep links)
  App.addListener('appUrlOpen', async ({ url }) => {
    console.log('App opened with URL:', url)

    // Handle auth success callback
    if (url.startsWith('pawzr://auth-success')) {
      // Close the browser
      try {
        await Browser.close()
      } catch (e) {
        console.log('Browser already closed')
      }

      // Parse the URL
      const urlObj = new URL(url.replace('pawzr://', 'https://pawzr.app/'))
      const token = urlObj.searchParams.get('token')
      const userId = urlObj.searchParams.get('userId')

      if (token && userId) {
        // Exchange token for session
        try {
          const response = await fetch('/api/auth/mobile-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, userId }),
          })

          if (response.ok) {
            const data = await response.json()
            // Redirect to dashboard or onboarding
            window.location.href = data.redirectTo || '/dashboard'
          } else {
            console.error('Token exchange failed')
            window.location.href = '/login?error=auth_failed'
          }
        } catch (error) {
          console.error('Auth callback error:', error)
          window.location.href = '/login?error=auth_failed'
        }
      }
      return
    }

    // Handle auth error callback
    if (url.startsWith('pawzr://auth-error')) {
      try {
        await Browser.close()
      } catch (e) {
        console.log('Browser already closed')
      }

      const urlObj = new URL(url.replace('pawzr://', 'https://pawzr.app/'))
      const error = urlObj.searchParams.get('error') || 'unknown'
      window.location.href = `/login?error=${error}`
      return
    }

    // Handle other pawzr:// URLs
    if (url.startsWith('pawzr://')) {
      const path = url.replace('pawzr://', '/')
      window.location.href = path
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

export async function openAuthUrl(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url })
  } else {
    window.location.href = url
  }
}

// Initialize Google Auth for native platforms
export async function initGoogleAuth(): Promise<void> {
  if (googleAuthInitialized || !Capacitor.isNativePlatform()) return

  GoogleAuth.initialize({
    clientId: '1094158533320-aumh0qgrr06o0o17umlulthgj3m72dlq.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  })
  googleAuthInitialized = true
}

// Native Google Sign-In
export async function nativeGoogleSignIn(): Promise<{ success: boolean; error?: string }> {
  try {
    await initGoogleAuth()

    const result = await GoogleAuth.signIn()

    if (result.authentication?.idToken) {
      // Exchange Google token with our backend
      const response = await fetch('https://pawzrpro.vercel.app/api/auth/google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: result.authentication.idToken,
          accessToken: result.authentication.accessToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.redirectTo || '/dashboard'
        return { success: true }
      } else {
        return { success: false, error: 'Failed to authenticate with server' }
      }
    }

    return { success: false, error: 'No ID token received' }
  } catch (error: any) {
    console.error('Google sign in error:', error)
    return { success: false, error: error.message || 'Sign in failed' }
  }
}
