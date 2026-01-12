'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/Loading'
import { isNativePlatform, googleSignIn } from '@/lib/capacitor'

type Step = 'role' | 'signup' | 'already_logged_in'

const roles = [
  {
    id: 'OWNER',
    title: 'Pet Owner',
    description: 'Find care for your pets',
    icon: '🐕',
    gradient: 'from-orange-400 to-amber-500',
  },
  {
    id: 'LOVER',
    title: 'Pet Lover',
    description: 'Offer pet care services',
    icon: '❤️',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    id: 'VET',
    title: 'Veterinarian',
    description: 'Manage your clinic',
    icon: '🩺',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    id: 'GROOMER',
    title: 'Groomer',
    description: 'Showcase your salon',
    icon: '✂️',
    gradient: 'from-purple-400 to-violet-500',
  },
  {
    id: 'SUPPLIER',
    title: 'Supplier',
    description: 'Sell pet products',
    icon: '🏪',
    gradient: 'from-blue-400 to-cyan-500',
  },
]

export default function SignupPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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

    if (selectedRole) {
      localStorage.setItem('pawzr_signup_role', selectedRole)
    }

    try {
      // Check if we're on a native platform
      if (isNativePlatform()) {
        // Use native Google OAuth with ASWebAuthenticationSession
        const result = await googleSignIn()
        if (!result.success) {
          setError(result.error || 'Sign up failed. Please try again.')
          setIsLoading(false)
        }
        // On success, googleSignIn() redirects automatically
      } else {
        // Use standard NextAuth flow for web
        signIn('google', { callbackUrl: '/onboarding' })
      }
    } catch (err) {
      console.error('Sign up error:', err)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
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

  // Already logged in
  if (step === 'already_logged_in' && session) {
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
            Continue Setup
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

  // Step 1: Role Selection
  if (step === 'role') {
    return (
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-3xl font-black text-orange-600" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Pawzr</h1>
          <p className="text-gray-500 mt-2">Choose how you want to join</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="w-full bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                {role.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{role.title}</h3>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  // Step 2: Sign up with selected role
  return (
    <div className="w-full max-w-sm">
      {/* Back Button */}
      <button
        onClick={goBack}
        className="flex items-center text-gray-500 mb-6 active:opacity-70"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Selected Role Header */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${selectedRoleData?.gradient} flex items-center justify-center text-4xl shadow-xl mb-4`}>
          {selectedRoleData?.icon}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 mt-1">Sign up as {selectedRoleData?.title}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Google Sign Up */}
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

      {/* Apple Sign Up - Placeholder */}
      <button
        disabled
        className="w-full bg-black text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-3 opacity-50 cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Continue with Apple
      </button>

      <p className="mt-8 text-center text-xs text-gray-400">
        By signing up, you agree to our Terms & Privacy Policy
      </p>
    </div>
  )
}
