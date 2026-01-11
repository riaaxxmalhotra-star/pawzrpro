'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'

export default function VerificationPage() {
  const { data: session } = useSession()
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setAadhaarImage(data.aadhaarImage)
        setIsVerified(data.aadhaarVerified)
        setIsPending(!!data.aadhaarImage && !data.aadhaarVerified)
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!aadhaarImage) {
      setMessage({ type: 'error', text: 'Please upload your Aadhaar card image' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/users/me/aadhaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaarImage }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Aadhaar card submitted for verification. This usually takes 24-48 hours.' })
        setIsPending(true)
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to submit verification' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Identity Verification</h1>

      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Aadhaar Card Verification</h2>
              <p className="text-sm text-gray-500">Upload your Aadhaar card to verify your identity</p>
            </div>
            {isVerified && (
              <Badge variant="success" className="ml-auto">Verified</Badge>
            )}
            {isPending && !isVerified && (
              <Badge variant="warning" className="ml-auto">Pending Review</Badge>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Why verify your identity?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Build trust with other users in the community</li>
              <li>Access premium features and higher booking limits</li>
              <li>Get a verified badge on your profile</li>
              <li>Required for pet lovers and service providers</li>
            </ul>
          </div>

          {isVerified ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-green-900">Your identity has been verified!</h3>
              <p className="text-sm text-green-700 mt-1">Your verified badge is now visible on your profile.</p>
            </div>
          ) : (
            <>
              <ImageUpload
                currentImage={aadhaarImage}
                onUpload={setAadhaarImage}
                label="Upload Aadhaar Card (Front)"
                className="mb-4"
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please ensure the image is clear and all details are readable.
                  Your Aadhaar number will be kept confidential and used only for verification purposes.
                </p>
              </div>

              {message && (
                <div className={`p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                isLoading={isSaving}
                disabled={isPending || !aadhaarImage}
                className="w-full"
              >
                {isPending ? 'Verification Pending' : 'Submit for Verification'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
