'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { LoadingSpinner } from '@/components/ui/Loading'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { AddressForm } from '@/components/ui/AddressForm'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import { LiveLocation } from '@/components/shared/LiveLocation'

interface Profile {
  name: string
  email: string
  countryCode: string
  phone: string
  addressLine1: string
  addressLine2: string
  landmark: string
  city: string
  state: string
  country: string
  zipCode: string
  latitude: number | null
  longitude: number | null
  googleMapsLink: string
  liveLocationEnabled: boolean
  bio: string
  avatar: string | null
  instagram: string | null
  aadhaarNumber: string | null
  aadhaarImage: string | null
  aadhaarVerified: boolean
}

export default function OwnerProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmittingAadhaar, setIsSubmittingAadhaar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [aadhaarImage, setAadhaarImage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setProfile({
          ...data,
          countryCode: data.countryCode || '+91',
          country: data.country || 'India',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        await update({ name: profile.name, image: profile.avatar })
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = (url: string) => {
    if (profile) {
      setProfile({ ...profile, avatar: url })
    }
  }

  const handleAadhaarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12)
    setAadhaarNumber(value)
  }

  const handleAadhaarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (aadhaarNumber.length !== 12) {
      setMessage({ type: 'error', text: 'Aadhaar number must be 12 digits' })
      return
    }

    if (!aadhaarImage) {
      setMessage({ type: 'error', text: 'Please upload your Aadhaar card image' })
      return
    }

    setIsSubmittingAadhaar(true)

    try {
      const res = await fetch('/api/users/me/aadhaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarNumber,
          aadhaarImage,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Aadhaar submitted for verification!' })
        fetchProfile()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to submit Aadhaar' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setIsSubmittingAadhaar(false)
    }
  }

  const handleLiveLocationToggle = async (enabled: boolean) => {
    if (profile) {
      setProfile({ ...profile, liveLocationEnabled: enabled })
    }
  }

  const handleLocationUpdate = async (latitude: number, longitude: number) => {
    try {
      await fetch('/api/users/me/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, enabled: true }),
      })
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Failed to load profile</p>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {profile.aadhaarVerified && <VerifiedBadge size="lg" showText />}
      </div>

      {/* Aadhaar Verification Section */}
      {!profile.aadhaarVerified && (
        <Card className="mb-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🪪</div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {profile.aadhaarNumber ? 'Verification Pending' : 'Get Verified'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {profile.aadhaarNumber
                  ? 'Your Aadhaar is under review. You\'ll receive a verified badge once approved.'
                  : 'Submit your Aadhaar to get a verified badge and build trust with pet lovers.'}
              </p>

              {!profile.aadhaarNumber && (
                <form onSubmit={handleAadhaarSubmit} className="mt-4 space-y-4">
                  <Input
                    label="Aadhaar Number"
                    type="text"
                    value={aadhaarNumber}
                    onChange={handleAadhaarNumberChange}
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={12}
                  />
                  <p className="text-xs text-gray-500 -mt-2">{aadhaarNumber.length}/12 digits</p>

                  <ImageUpload
                    currentImage={aadhaarImage}
                    onUpload={(url) => setAadhaarImage(url)}
                    label="Upload Aadhaar Card (Front)"
                  />

                  <Button type="submit" isLoading={isSubmittingAadhaar}>
                    Submit for Verification
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Live Location */}
      <div className="mb-6">
        <LiveLocation
          isEnabled={profile.liveLocationEnabled}
          onToggle={handleLiveLocationToggle}
          onLocationUpdate={handleLocationUpdate}
        />
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <ImageUpload
            currentImage={profile.avatar}
            onUpload={handleAvatarUpload}
            label="Profile Photo"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Phone Input with Country Code */}
          <PhoneInput
            label="Phone Number"
            countryCode={profile.countryCode || '+91'}
            phone={profile.phone || ''}
            onCountryCodeChange={(code) => setProfile({ ...profile, countryCode: code })}
            onPhoneChange={(phone) => setProfile({ ...profile, phone })}
          />

          {/* Instagram */}
          <Input
            label="Instagram Handle (optional)"
            value={profile.instagram || ''}
            onChange={(e) => setProfile({ ...profile, instagram: e.target.value.replace('@', '') })}
            placeholder="your_instagram_handle"
          />

          {/* Address Form */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Address Details</h3>
            <AddressForm
              address={{
                addressLine1: profile.addressLine1 || '',
                addressLine2: profile.addressLine2 || '',
                landmark: profile.landmark || '',
                city: profile.city || '',
                state: profile.state || '',
                country: profile.country || 'India',
                zipCode: profile.zipCode || '',
                latitude: profile.latitude,
                longitude: profile.longitude,
                googleMapsLink: profile.googleMapsLink || '',
              }}
              onChange={(addressData) => setProfile({ ...profile, ...addressData })}
            />
          </div>

          <Textarea
            label="Bio"
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={3}
          />

          <div className="sticky bottom-0 bg-white pt-4 pb-6 -mx-6 px-6 border-t mt-6 sm:relative sm:border-t-0 sm:mt-0 sm:pb-0 sm:pt-0 sm:mx-0 sm:px-0">
            <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
