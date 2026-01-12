'use client'

import { Suspense, useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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
      // For native app, open OAuth in external browser
      const baseUrl = 'https://pawzrpro.vercel.app'
      const authUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(baseUrl + callbackUrl)}`

      await Browser.open({ url: authUrl, presentationStyle: 'popover' })

      // Add listener for when app resumes
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

      // Stop checking after 2 minutes
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

  // If already logged in, show options
  if (status === 'authenticated' && session) {
    return (
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">👋</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">
            You&apos;re already signed in as <strong>{session.user?.email}</strong>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleContinueAsUser}
          >
            Continue to Dashboard
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
            isLoading={isLoading}
          >
            Sign out & use different account
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="elevated" className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-600 mt-1">Sign in to your Pawzr account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <Button
        className="w-full h-14"
        onClick={handleGoogleSignIn}
        isLoading={isLoading}
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </Button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
          Sign up
        </Link>
      </p>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><LoadingSpinner size="lg" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
