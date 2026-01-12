'use client'

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { GenericOAuth2 } from '@capacitor-community/generic-oauth2'

let initialized = false
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
    await Browser.open({ url, presentationStyle: 'fullscreen' })
  } else {
    window.location.href = url
  }
}

// Google OAuth using ASWebAuthenticationSession (accepted by Google)
export async function googleSignIn(): Promise<{ success: boolean; error?: string }> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'Not on native platform' }
  }

  try {
    const oauth2Options = {
      authorizationBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      accessTokenEndpoint: 'https://oauth2.googleapis.com/token',
      scope: 'openid email profile',
      resourceUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      web: {
        appId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        responseType: 'code',
        accessTokenEndpoint: '',
        redirectUrl: 'https://pawzrpro.vercel.app/api/auth/callback/google',
      },
      ios: {
        appId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        responseType: 'code',
        redirectUrl: 'com.pawzr.app:/oauth2redirect',
      },
      android: {
        appId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        responseType: 'code',
        redirectUrl: 'com.pawzr.app:/oauth2redirect',
      },
    }

    const result = await GenericOAuth2.authenticate(oauth2Options)

    if (result.access_token) {
      // Exchange the Google token with our backend
      const response = await fetch('/api/auth/google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: result.access_token,
          idToken: result.id_token
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

    return { success: false, error: 'No access token received' }
  } catch (error) {
    console.error('Google sign in error:', error)
    return { success: false, error: String(error) }
  }
}
