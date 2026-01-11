'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'

type LoginMethod = 'email' | 'phone'
type PhoneStep = 'enter_phone' | 'enter_otp'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter_phone')

  // Email login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Phone login state
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [phoneLoginData, setPhoneLoginData] = useState<{ userId: string; token: string } | null>(null)
  const [debugCode, setDebugCode] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push(callbackUrl)
        router.refresh()
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
        setPhoneStep('enter_otp')
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
      // Verify OTP and get login token
      const verifyRes = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        if (verifyData.needsSignup) {
          setError('No account found. Please sign up first.')
        } else {
          setError(verifyData.error || 'Invalid OTP')
        }
        setIsLoading(false)
        return
      }

      // Use the phone login token to sign in via NextAuth
      const result = await signIn('phone', {
        userId: verifyData.user.id,
        phoneLoginToken: verifyData.phoneLoginToken,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedValue.forEach((char, i) => {
        if (i + index < 6 && /^\d$/.test(char)) {
          newOtp[i + index] = char
        }
      })
      setOtp(newOtp)

      // Focus last filled or next empty
      const lastFilledIndex = Math.min(index + pastedValue.length - 1, 5)
      const nextInput = document.getElementById(`otp-${lastFilledIndex}`)
      nextInput?.focus()
    } else if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
    if (e.key === 'Enter' && otp.join('').length === 6) {
      handleVerifyOTP()
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  const resetPhoneLogin = () => {
    setPhoneStep('enter_phone')
    setOtp(['', '', '', '', '', ''])
    setDebugCode(null)
    setError('')
  }

  return (
    <Card variant="elevated" className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-600 mt-1">Sign in to your Pawzr account</p>
      </div>

      {/* Login method tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => { setLoginMethod('email'); setError('') }}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
            loginMethod === 'email'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => { setLoginMethod('phone'); resetPhoneLogin() }}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
            loginMethod === 'phone'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Phone
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loginMethod === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-orange-600 hover:text-orange-700">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          {phoneStep === 'enter_phone' ? (
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

              <Button
                type="button"
                className="w-full"
                onClick={handleVerifyOTP}
                isLoading={isLoading}
              >
                Verify & Sign In
              </Button>

              <button
                type="button"
                onClick={resetPhoneLogin}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Use a different phone number
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-4"
          onClick={handleGoogleSignIn}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>

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
