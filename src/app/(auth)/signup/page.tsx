'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

type Step = 'role' | 'auth_method' | 'email_auth' | 'phone_auth' | 'create_account'
type AuthMethod = 'email' | 'phone' | 'apple' | 'google' | 'create'

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
  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState('')

  // Email auth state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  // Phone auth state
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [phoneStep, setPhoneStep] = useState<'enter' | 'verify'>('enter')
  const [debugCode, setDebugCode] = useState<string | null>(null)

  // Create account state
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [createMethod, setCreateMethod] = useState<'email' | 'phone'>('email')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    setStep('auth_method')
  }

  const handleAuthMethodSelect = (method: AuthMethod) => {
    setError('')
    if (method === 'google') {
      // Store role in localStorage for post-auth
      localStorage.setItem('pendingRole', selectedRole)
      signIn('google', { callbackUrl: '/onboarding' })
    } else if (method === 'apple') {
      localStorage.setItem('pendingRole', selectedRole)
      signIn('apple', { callbackUrl: '/onboarding' })
    } else if (method === 'email') {
      setStep('email_auth')
    } else if (method === 'phone') {
      setStep('phone_auth')
    } else if (method === 'create') {
      setStep('create_account')
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login with email
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          // Update user role if needed and redirect
          localStorage.setItem('pendingRole', selectedRole)
          router.push('/onboarding')
        }
      } else {
        // Quick signup with email - redirect to create account
        setCreateMethod('email')
        setStep('create_account')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()

      if (res.ok) {
        setPhoneStep('verify')
        if (data.debug_code) {
          setDebugCode(data.debug_code)
        }
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch {
      setError('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError('')
    setIsLoading(true)

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      setIsLoading(false)
      return
    }

    try {
      const verifyRes = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        if (verifyData.needsSignup) {
          // No account - go to create account
          setCreateMethod('phone')
          setStep('create_account')
        } else {
          setError(verifyData.error || 'Invalid OTP')
        }
        setIsLoading(false)
        return
      }

      // Login successful
      const result = await signIn('phone', {
        userId: verifyData.user.id,
        phoneLoginToken: verifyData.phoneLoginToken,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        localStorage.setItem('pendingRole', selectedRole)
        router.push('/onboarding')
      }
    } catch {
      setError('Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: createMethod === 'email' ? email : undefined,
          phone: createMethod === 'phone' ? phone : undefined,
          password,
          role: selectedRole,
          phoneVerified: createMethod === 'phone',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Sign in after registration
      if (createMethod === 'email') {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          router.push('/onboarding')
        }
      } else {
        // For phone signup, send OTP and sign in
        const otpRes = await fetch('/api/auth/phone/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        })

        const otpData = await otpRes.json()

        if (otpRes.ok) {
          const verifyRes = await fetch('/api/auth/phone/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp: otpData.debug_code }),
          })

          const verifyData = await verifyRes.json()

          if (verifyRes.ok) {
            const result = await signIn('phone', {
              userId: verifyData.user.id,
              phoneLoginToken: verifyData.phoneLoginToken,
              redirect: false,
            })

            if (!result?.error) {
              router.push('/onboarding')
            }
          }
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedValue = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedValue.forEach((char, i) => {
        if (i + index < 6 && /^\d$/.test(char)) {
          newOtp[i + index] = char
        }
      })
      setOtp(newOtp)
      const lastFilledIndex = Math.min(index + pastedValue.length - 1, 5)
      document.getElementById(`otp-${lastFilledIndex}`)?.focus()
    } else if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
    if (e.key === 'Enter' && otp.join('').length === 6) {
      handleVerifyOTP()
    }
  }

  const goBack = () => {
    setError('')
    if (step === 'auth_method') {
      setStep('role')
    } else if (step === 'email_auth' || step === 'phone_auth') {
      setStep('auth_method')
      setPhoneStep('enter')
      setOtp(['', '', '', '', '', ''])
    } else if (step === 'create_account') {
      setStep('auth_method')
    }
  }

  const selectedRoleData = roles.find((r) => r.id === selectedRole)

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

  // Step 2: Auth Method Selection
  if (step === 'auth_method') {
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
          <h1 className="text-2xl font-bold text-gray-900">Continue as {selectedRoleData?.title}</h1>
          <p className="text-gray-600 mt-1">Choose how you&apos;d like to sign in</p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-14 text-left"
            onClick={() => handleAuthMethodSelect('email')}
          >
            <span className="text-xl mr-3">📧</span>
            Continue with Email
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-14 text-left"
            onClick={() => handleAuthMethodSelect('phone')}
          >
            <span className="text-xl mr-3">📱</span>
            Continue with Phone
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-14 text-left"
            onClick={() => handleAuthMethodSelect('apple')}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-14 text-left"
            onClick={() => handleAuthMethodSelect('google')}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <Button
            className="w-full h-14"
            onClick={() => handleAuthMethodSelect('create')}
          >
            Create New Account
          </Button>
        </div>
      </Card>
    )
  }

  // Step 3a: Email Authentication
  if (step === 'email_auth') {
    return (
      <Card variant="elevated" className="w-full max-w-md">
        <button onClick={goBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Sign in with Email' : 'Sign up with Email'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {isLogin ? 'Sign In' : 'Continue'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </Card>
    )
  }

  // Step 3b: Phone Authentication
  if (step === 'phone_auth') {
    return (
      <Card variant="elevated" className="w-full max-w-md">
        <button onClick={goBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sign in with Phone</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {phoneStep === 'enter' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Send OTP
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter the 6-digit code sent to {phone}
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ))}
              </div>
            </div>

            {debugCode && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Dev Mode:</strong> Your OTP is <code className="bg-yellow-100 px-1 rounded">{debugCode}</code>
                </p>
              </div>
            )}

            <Button type="button" className="w-full" onClick={handleVerifyOTP} isLoading={isLoading}>
              Verify & Continue
            </Button>

            <button
              type="button"
              onClick={() => {
                setPhoneStep('enter')
                setOtp(['', '', '', '', '', ''])
                setDebugCode(null)
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Use a different phone number
            </button>
          </div>
        )}
      </Card>
    )
  }

  // Step 3c: Create Account
  if (step === 'create_account') {
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-1">as a {selectedRoleData?.title}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Method toggle */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setCreateMethod('email')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              createMethod === 'email'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setCreateMethod('phone')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              createMethod === 'phone'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleCreateAccount} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />

          {createMethod === 'email' ? (
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          ) : (
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
            />
          )}

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-orange-600 hover:underline">Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>
        </p>
      </Card>
    )
  }

  return null
}
