'use client'

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { SocialLogin } from '@capgo/capacitor-social-login'

let initialized = false
let socialLoginInitialized = false

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
  const isNative = Capacitor.isNativePlatform()
  console.log('isNativePlatform:', isNative, 'platform:', Capacitor.getPlatform())
  return isNative
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

// Initialize Social Login
async function initSocialLogin() {
  if (socialLoginInitialized || !Capacitor.isNativePlatform()) return

  await SocialLogin.initialize({
    google: {
      iOSClientId: '1094158533320-7fugh8bijpp1770uo21b0ubf8f36odp1.apps.googleusercontent.com',
      iOSServerClientId: '1094158533320-aumh0qgrr06o0o17umlulthgj3m72dlq.apps.googleusercontent.com',
    },
    apple: {
      clientId: 'com.pawzr.app',
    }
  })
  socialLoginInitialized = true
}

// Native Google Sign-In
export async function nativeGoogleSignIn(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('nativeGoogleSignIn: Starting...')
    console.log('nativeGoogleSignIn: isNative =', Capacitor.isNativePlatform())

    await initSocialLogin()
    console.log('nativeGoogleSignIn: SocialLogin initialized')

    const result = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: ['email', 'profile'],
      }
    })
    console.log('nativeGoogleSignIn: Login result =', JSON.stringify(result))

    if (result?.result?.idToken) {
      // Exchange token with backend
      const response = await fetch('https://pawzrpro.vercel.app/api/auth/google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: result.result.idToken,
          accessToken: result.result.accessToken,
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

// Native Apple Sign-In
export async function nativeAppleSignIn(): Promise<{ success: boolean; error?: string }> {
  try {
    await initSocialLogin()

    const result = await SocialLogin.login({
      provider: 'apple',
      options: {
        scopes: ['email', 'name'],
      }
    })

    if (result?.result?.idToken) {
      // Exchange token with backend
      const response = await fetch('https://pawzrpro.vercel.app/api/auth/apple-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: result.result.idToken,
          user: result.result.user,
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
    console.error('Apple sign in error:', error)
    return { success: false, error: error.message || 'Sign in failed' }
  }
}
// Force rebuild Mon Jan 12 14:54:36 IST 2026
