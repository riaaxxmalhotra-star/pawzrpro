'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { isNativeApp } from '@/lib/native-auth'
import { Browser } from '@capacitor/browser'

type Step = 'role' | 'signup' | 'already_logged_in'

const roles = [
  {
    id: 'OWNER',
    title: 'Pet Owner',
    description: 'Find walkers, groomers, vets, and supplies',
    icon: '🐕',
    color: 'border-orange-400 bg-orange-50',
  },
  {
    id: 'LOVER',
    title: 'Pet Lover',
    description: 'Offer walking, sitting, and pet care services',
    icon: '❤️',
    color: 'border-pink-400 bg-pink-50',
  },
  {
    id: 'VET',
    title: 'Veterinarian',
    description: 'Manage your clinic and patient appointments',
    icon: '🩺',
    color: 'border-green-400 bg-green-50',
  },
  {
    id: 'GROOMER',
    title: 'Groomer',
    description: 'Showcase your salon and manage bookings',
    icon: '✂️',
    color: 'border-purple-400 bg-purple-50',
  },
  {
    id: 'SUPPLIER',
    title: 'Supplier',
    description: 'Sell pet products to thousands of pet owners',
    icon: '🏪',
    color: 'border-blue-400 bg-blue-50',
  },
]

export default function SignupPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in, show options instead of auto-redirect
  useEffect(() => {
    if (status === 'authenticated' && session) {
      setStep('already_logged_in')
    }
  }, [status, session])

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    setStep('signup')
    setError('')
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')

    // Store selected role in localStorage before OAuth redirect
    if (selectedRole) {
      localStorage.setItem('pawzr_signup_role', selectedRole)
    }

    if (isNativeApp()) {
      // For native app, open OAuth in external browser
      const baseUrl = 'https://pawzrpro.vercel.app'
      const authUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(baseUrl + '/onboarding')}`

      await Browser.open({ url: authUrl, presentationStyle: 'popover' })

      // Add listener for when app resumes
      const checkSession = setInterval(async () => {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data?.user) {
          clearInterval(checkSession)
          setIsLoading(false)
          try { await Browser.close() } catch {}
          router.push('/onboarding')
        }
      }, 1000)

      // Stop checking after 2 minutes
      setTimeout(() => {
        clearInterval(checkSession)
        setIsLoading(false)
      }, 120000)
    } else {
      signIn('google', { callbackUrl: '/onboarding' })
    }
  }

  const goBack = () => {
    setStep('role')
    setError('')
  }

  const selectedRoleData = roles.find((r) => r.id === selectedRole)

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    setStep('role')
    setIsLoading(false)
  }

  const handleContinueAsUser = () => {
    router.push('/onboarding')
  }

  // Already logged in - show options
  if (step === 'already_logged_in' && session) {
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

  // Step 1: Role Selection
  if (step === 'role') {
    return (
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join Pawzr</h1>
          <p className="text-gray-600 mt-2">Select your role to get started</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg hover:-translate-y-1 ${role.color}`}
            >
              <div className="text-4xl mb-3">{role.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{role.description}</p>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  // Step 2: Google Sign In
  return (
    <Card variant="elevated" className="w-full max-w-md">
      <button onClick={goBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{selectedRoleData?.icon}</div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-1">Join as {selectedRoleData?.title}</p>
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
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-xs text-gray-500">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-orange-600 hover:underline">Terms</Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>
      </p>
    </Card>
  )
}
