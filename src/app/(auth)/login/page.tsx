'use client'

import { Suspense, useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Loading'
import { isNativeApp } from '@/lib/native-auth'
import { Browser } from '@capacitor/browser'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams.get('error')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case 'OAuthAccountNotLinked':
          setError('This email is already registered with a different sign-in method.')
          break
        case 'OAuthCallback':
          setError('There was a problem with Google sign-in. Please try again.')
          break
        case 'OAuthSignin':
          setError('Could not start Google sign-in. Please try again.')
          break
        case 'Callback':
          setError('Authentication failed. Please try again.')
          break
        default:
          setError('An error occurred during sign-in. Please try again.')
      }
    }
  }, [errorParam])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    if (isNativeApp()) {
      const baseUrl = 'https://pawzrpro.vercel.app'
      const authUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(baseUrl + callbackUrl)}`

      await Browser.open({ url: authUrl, presentationStyle: 'popover' })

      const checkSession = setInterval(async () => {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data?.user) {
          clearInterval(checkSession)
          setIsLoading(false)
          try { await Browser.close() } catch {}
          router.push(callbackUrl)
        }
      }, 1000)

      setTimeout(() => {
        clearInterval(checkSession)
        setIsLoading(false)
      }, 120000)
    } else {
      signIn('google', { callbackUrl })
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    setIsLoading(false)
  }

  const handleContinueAsUser = () => {
    router.push(callbackUrl)
  }

  // If already logged in
  if (status === 'authenticated' && session) {
    return (
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Signed in as <span className="font-medium text-gray-700">{session.user?.email}</span>
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleContinueAsUser}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-orange-600/30 active:scale-[0.98] transition-transform"
          >
            Continue to Dashboard
          </button>

          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full bg-white text-gray-700 py-4 rounded-2xl font-semibold text-lg shadow-md border border-gray-200 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isLoading ? 'Signing out...' : 'Use Different Account'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">🐾</div>
        <h1 className="text-3xl font-bold text-orange-600">Pawzr</h1>
        <p className="text-gray-500 mt-2">Sign in to continue</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-white py-4 px-6 rounded-2xl font-semibold text-gray-700 shadow-lg border border-gray-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-sm text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Apple Sign In - Placeholder */}
      <button
        disabled
        className="w-full bg-black text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-3 opacity-50 cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Continue with Apple
      </button>

      {/* Sign up link */}
      <p className="mt-8 text-center text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-orange-600 font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><LoadingSpinner size="lg" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
