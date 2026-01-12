'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'

interface VerificationStatus {
  email: string
  emailVerified: boolean
  phone: string | null
  phoneVerified: boolean
  aadhaarNumber: string | null
  aadhaarImage: string | null
  aadhaarVerified: boolean
}

export default function VerificationPage() {
  const { data: session } = useSession()
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Email verification state
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', ''])
  const [emailSending, setEmailSending] = useState(false)
  const [emailVerifying, setEmailVerifying] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Phone verification state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneCodeSent, setPhoneCodeSent] = useState(false)
  const [phoneCode, setPhoneCode] = useState(['', '', '', '', '', ''])
  const [phoneSending, setPhoneSending] = useState(false)
  const [phoneVerifying, setPhoneVerifying] = useState(false)
  const [phoneMessage, setPhoneMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Aadhaar state
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null)
  const [aadhaarSaving, setAadhaarSaving] = useState(false)
  const [aadhaarMessage, setAadhaarMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setStatus({
          email: data.email,
          emailVerified: !!data.emailVerified,
          phone: data.phone,
          phoneVerified: !!data.phoneVerified,
          aadhaarNumber: data.aadhaarNumber,
          aadhaarImage: data.aadhaarImage,
          aadhaarVerified: data.aadhaarVerified,
        })
        setPhoneNumber(data.phone || '')
        setAadhaarNumber(data.aadhaarNumber || '')
        setAadhaarImage(data.aadhaarImage)
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Email verification handlers
  const sendEmailCode = async () => {
    setEmailSending(true)
    setEmailMessage(null)
    try {
      const res = await fetch('/api/verify/email', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setEmailCodeSent(true)
        setEmailMessage({ type: 'success', text: 'Verification code sent to your email!' })
        // For testing in development
        if (data.debug_code) {
          setEmailMessage({ type: 'success', text: `Code sent! (Dev mode: ${data.debug_code})` })
        }
      } else {
        setEmailMessage({ type: 'error', text: data.error || 'Failed to send code' })
      }
    } catch (error) {
      setEmailMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setEmailSending(false)
    }
  }

  const verifyEmailCode = async () => {
    const code = emailCode.join('')
    if (code.length !== 6) {
      setEmailMessage({ type: 'error', text: 'Please enter the complete 6-digit code' })
      return
    }

    setEmailVerifying(true)
    setEmailMessage(null)
    try {
      const res = await fetch('/api/verify/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (res.ok) {
        setEmailMessage({ type: 'success', text: 'Email verified successfully!' })
        setStatus(prev => prev ? { ...prev, emailVerified: true } : null)
        setEmailCodeSent(false)
      } else {
        setEmailMessage({ type: 'error', text: data.error || 'Invalid code' })
      }
    } catch (error) {
      setEmailMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setEmailVerifying(false)
    }
  }

  // Phone verification handlers
  const sendPhoneCode = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      setPhoneMessage({ type: 'error', text: 'Please enter a valid phone number' })
      return
    }

    setPhoneSending(true)
    setPhoneMessage(null)
    try {
      const res = await fetch('/api/verify/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      })
      const data = await res.json()
      if (res.ok) {
        setPhoneCodeSent(true)
        setPhoneMessage({ type: 'success', text: 'Verification code sent to your phone!' })
        // For testing in development
        if (data.debug_code) {
          setPhoneMessage({ type: 'success', text: `Code sent! (Dev mode: ${data.debug_code})` })
        }
      } else {
        setPhoneMessage({ type: 'error', text: data.error || 'Failed to send code' })
      }
    } catch (error) {
      setPhoneMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setPhoneSending(false)
    }
  }

  const verifyPhoneCode = async () => {
    const code = phoneCode.join('')
    if (code.length !== 6) {
      setPhoneMessage({ type: 'error', text: 'Please enter the complete 6-digit code' })
      return
    }

    setPhoneVerifying(true)
    setPhoneMessage(null)
    try {
      const res = await fetch('/api/verify/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (res.ok) {
        setPhoneMessage({ type: 'success', text: 'Phone number verified successfully!' })
        setStatus(prev => prev ? { ...prev, phoneVerified: true, phone: phoneNumber } : null)
        setPhoneCodeSent(false)
      } else {
        setPhoneMessage({ type: 'error', text: data.error || 'Invalid code' })
      }
    } catch (error) {
      setPhoneMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setPhoneVerifying(false)
    }
  }

  // OTP input handler
  const handleCodeInput = (
    index: number,
    value: string,
    codeArray: string[],
    setCodeArray: React.Dispatch<React.SetStateAction<string[]>>,
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newCode = [...codeArray]
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit
      })
      setCodeArray(newCode)
      const nextIndex = Math.min(digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    const newCode = [...codeArray]
    newCode[index] = value.replace(/\D/g, '')
    setCodeArray(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    codeArray: string[],
    setCodeArray: React.Dispatch<React.SetStateAction<string[]>>,
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === 'Backspace' && !codeArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Aadhaar handlers
  const handleAadhaarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12)
    setAadhaarNumber(value)
  }

  const submitAadhaar = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setAadhaarMessage({ type: 'error', text: 'Please enter a valid 12-digit Aadhaar number' })
      return
    }
    if (!aadhaarImage) {
      setAadhaarMessage({ type: 'error', text: 'Please upload your Aadhaar card image' })
      return
    }

    setAadhaarSaving(true)
    setAadhaarMessage(null)
    try {
      const res = await fetch('/api/users/me/aadhaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaarNumber, aadhaarImage }),
      })
      if (res.ok) {
        setAadhaarMessage({ type: 'success', text: 'Aadhaar submitted for verification!' })
        setStatus(prev => prev ? { ...prev, aadhaarNumber, aadhaarImage } : null)
      } else {
        const data = await res.json()
        setAadhaarMessage({ type: 'error', text: data.error || 'Failed to submit' })
      }
    } catch (error) {
      setAadhaarMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setAadhaarSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const OTPInput = ({
    code,
    setCode,
    inputRefs,
    disabled,
  }: {
    code: string[]
    setCode: React.Dispatch<React.SetStateAction<string[]>>
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
    disabled?: boolean
  }) => (
    <div className="flex gap-2 justify-center">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={digit}
          onChange={(e) => handleCodeInput(index, e.target.value, code, setCode, inputRefs)}
          onKeyDown={(e) => handleCodeKeyDown(index, e, code, setCode, inputRefs)}
          disabled={disabled}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100"
        />
      ))}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Verification</h1>
        <p className="text-gray-600">Verify your email, phone, and identity to unlock all features</p>
      </div>

      {/* Email Verification */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">Email Verification</h2>
              <p className="text-sm text-gray-500">{status?.email}</p>
            </div>
          </div>
          {status?.emailVerified ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="warning">Not Verified</Badge>
          )}
        </div>

        {!status?.emailVerified && (
          <div className="space-y-4">
            {!emailCodeSent ? (
              <Button onClick={sendEmailCode} isLoading={emailSending} className="w-full">
                Send Verification Code
              </Button>
            ) : (
              <>
                <p className="text-sm text-center text-gray-600">Enter the 6-digit code sent to your email</p>
                <OTPInput code={emailCode} setCode={setEmailCode} inputRefs={emailInputRefs} disabled={emailVerifying} />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={sendEmailCode} isLoading={emailSending} className="flex-1">
                    Resend Code
                  </Button>
                  <Button onClick={verifyEmailCode} isLoading={emailVerifying} className="flex-1">
                    Verify
                  </Button>
                </div>
              </>
            )}
            {emailMessage && (
              <p className={`text-sm text-center ${emailMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {emailMessage.text}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Phone Verification */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">Phone Verification</h2>
              <p className="text-sm text-gray-500">{status?.phone || 'Not added'}</p>
            </div>
          </div>
          {status?.phoneVerified ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="warning">Not Verified</Badge>
          )}
        </div>

        {!status?.phoneVerified && (
          <div className="space-y-4">
            {!phoneCodeSent ? (
              <>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 9876543210"
                />
                <Button onClick={sendPhoneCode} isLoading={phoneSending} className="w-full">
                  Send Verification Code
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-center text-gray-600">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
                <OTPInput code={phoneCode} setCode={setPhoneCode} inputRefs={phoneInputRefs} disabled={phoneVerifying} />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setPhoneCodeSent(false)} className="flex-1">
                    Change Number
                  </Button>
                  <Button onClick={verifyPhoneCode} isLoading={phoneVerifying} className="flex-1">
                    Verify
                  </Button>
                </div>
              </>
            )}
            {phoneMessage && (
              <p className={`text-sm text-center ${phoneMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {phoneMessage.text}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Aadhaar Verification */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">Identity Verification (Aadhaar)</h2>
              <p className="text-sm text-gray-500">Required for service providers</p>
            </div>
          </div>
          {status?.aadhaarVerified ? (
            <Badge variant="success">Verified</Badge>
          ) : status?.aadhaarImage ? (
            <Badge variant="warning">Pending Review</Badge>
          ) : (
            <Badge variant="default">Not Submitted</Badge>
          )}
        </div>

        {!status?.aadhaarVerified && (
          <div className="space-y-4">
            <Input
              label="Aadhaar Number"
              type="text"
              value={aadhaarNumber}
              onChange={handleAadhaarNumberChange}
              placeholder="Enter 12-digit Aadhaar number"
              maxLength={12}
              disabled={!!status?.aadhaarImage}
            />
            <p className="text-xs text-gray-500 -mt-2">
              {aadhaarNumber.length}/12 digits
            </p>
            <ImageUpload
              currentImage={aadhaarImage}
              onUpload={setAadhaarImage}
              label="Upload Aadhaar Card (Front)"
            />
            <p className="text-xs text-gray-500">
              Your Aadhaar details are kept confidential and used only for verification.
            </p>
            <Button
              onClick={submitAadhaar}
              isLoading={aadhaarSaving}
              disabled={!aadhaarImage || !aadhaarNumber || aadhaarNumber.length !== 12 || !!status?.aadhaarImage}
              className="w-full"
            >
              {status?.aadhaarImage ? 'Pending Review' : 'Submit for Verification'}
            </Button>
            {aadhaarMessage && (
              <p className={`text-sm text-center ${aadhaarMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {aadhaarMessage.text}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Verification Benefits */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Why verify your account?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Build trust with other users in the community
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Get a verified badge on your profile
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Access premium features and higher limits
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Required for pet lovers and service providers
          </li>
        </ul>
      </Card>
    </div>
  )
}
