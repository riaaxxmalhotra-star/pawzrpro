'use client'

import { useState, useEffect, useRef } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface FirebasePhoneAuthProps {
  onVerified: (phoneNumber: string, firebaseUid: string) => void
  onError: (error: string) => void
}

export function FirebasePhoneAuth({ onVerified, onError }: FirebasePhoneAuthProps) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Cleanup recaptcha on unmount
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
      }
    }
  }, [])

  const initRecaptcha = () => {
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current && auth) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          onError('reCAPTCHA expired. Please try again.')
        }
      })
    }
    return recaptchaVerifierRef.current
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!auth) {
        onError('Firebase not configured')
        setIsLoading(false)
        return
      }

      const recaptcha = initRecaptcha()
      if (!recaptcha) {
        onError('Failed to initialize reCAPTCHA')
        setIsLoading(false)
        return
      }

      // Format phone number with country code
      let formattedPhone = phone.replace(/[\s-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone.replace(/^0/, '')
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptcha)
      setConfirmationResult(result)
      setStep('otp')
    } catch (error: any) {
      console.error('Send OTP error:', error)
      if (error.code === 'auth/invalid-phone-number') {
        onError('Invalid phone number format')
      } else if (error.code === 'auth/too-many-requests') {
        onError('Too many attempts. Please try again later.')
      } else {
        onError(error.message || 'Failed to send OTP')
      }
      // Reset recaptcha on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
        recaptchaVerifierRef.current = null
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!confirmationResult) {
      onError('Please request OTP first')
      return
    }

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      onError('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      const result = await confirmationResult.confirm(otpCode)
      const user = result.user

      // Format phone for our database
      let formattedPhone = phone.replace(/[\s-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone.replace(/^0/, '')
      }

      onVerified(formattedPhone, user.uid)
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      if (error.code === 'auth/invalid-verification-code') {
        onError('Invalid OTP. Please check and try again.')
      } else if (error.code === 'auth/code-expired') {
        onError('OTP expired. Please request a new one.')
      } else {
        onError(error.message || 'Failed to verify OTP')
      }
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
      const lastFilledIndex = Math.min(index + pastedValue.length - 1, 5)
      document.getElementById(`firebase-otp-${lastFilledIndex}`)?.focus()
    } else if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      if (value && index < 5) {
        document.getElementById(`firebase-otp-${index + 1}`)?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`firebase-otp-${index - 1}`)?.focus()
    }
    if (e.key === 'Enter' && otp.join('').length === 6) {
      handleVerifyOTP()
    }
  }

  const resetPhone = () => {
    setStep('phone')
    setOtp(['', '', '', '', '', ''])
    setConfirmationResult(null)
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear()
      recaptchaVerifierRef.current = null
    }
  }

  return (
    <div className="space-y-4">
      {/* Hidden recaptcha container */}
      <div ref={recaptchaContainerRef} id="recaptcha-container" />

      {step === 'phone' ? (
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
                  id={`firebase-otp-${index}`}
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

          <Button
            type="button"
            className="w-full"
            onClick={handleVerifyOTP}
            isLoading={isLoading}
          >
            Verify OTP
          </Button>

          <button
            type="button"
            onClick={resetPhone}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Use a different phone number
          </button>
        </div>
      )}
    </div>
  )
}
