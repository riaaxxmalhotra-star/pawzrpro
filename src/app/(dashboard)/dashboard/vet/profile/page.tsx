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
  bio: string
  avatar: string | null
  instagram: string | null
  aadhaarNumber: string | null
  aadhaarImage: string | null
  aadhaarVerified: boolean
}

interface VetProfile {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  hours: string
  license: string
  licenseVerified: boolean
  services: string
  specializations: string
  videoCallRate: number | null
}

export default function VetProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [vetProfile, setVetProfile] = useState<VetProfile | null>(null)
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
      const [userRes, vetRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/profiles/vet'),
      ])

      if (userRes.ok) {
        const data = await userRes.json()
        setProfile({
          ...data,
          countryCode: data.countryCode || '+91',
          country: data.country || 'India',
        })
      }

      if (vetRes.ok) {
        const data = await vetRes.json()
        setVetProfile({
          clinicName: data.clinicName || '',
          clinicAddress: data.clinicAddress || '',
          clinicPhone: data.clinicPhone || '',
          hours: data.hours || '',
          license: data.license || '',
          licenseVerified: data.licenseVerified || false,
          services: data.services || '',
          specializations: data.specializations || '',
          videoCallRate: data.videoCallRate || null,
        })
      } else {
        setVetProfile({
          clinicName: '',
          clinicAddress: '',
          clinicPhone: '',
          hours: '',
          license: '',
          licenseVerified: false,
          services: '',
          specializations: '',
          videoCallRate: null,
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
      const [userRes, vetRes] = await Promise.all([
        fetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        }),
        fetch('/api/profiles/vet', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vetProfile),
        }),
      ])

      if (userRes.ok && vetRes.ok) {
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
        {vetProfile?.licenseVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Licensed Vet
          </span>
        )}
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
                  : 'Submit your Aadhaar to get a verified badge and build trust with pet owners.'}
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
            placeholder="your_clinic_instagram"
          />

          {/* Vet Specific Fields */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Clinic Information</h3>

            <div className="space-y-4">
              <Input
                label="Clinic Name"
                value={vetProfile?.clinicName || ''}
                onChange={(e) => setVetProfile(prev => prev ? { ...prev, clinicName: e.target.value } : null)}
                placeholder="Enter your clinic name"
              />

              <Textarea
                label="Clinic Address"
                value={vetProfile?.clinicAddress || ''}
                onChange={(e) => setVetProfile(prev => prev ? { ...prev, clinicAddress: e.target.value } : null)}
                placeholder="Enter your clinic's full address"
                rows={2}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Clinic Phone"
                  value={vetProfile?.clinicPhone || ''}
                  onChange={(e) => setVetProfile(prev => prev ? { ...prev, clinicPhone: e.target.value } : null)}
                  placeholder="Clinic contact number"
                />

                <Input
                  label="Video Call Rate (INR/session)"
                  type="number"
                  value={vetProfile?.videoCallRate || ''}
                  onChange={(e) => setVetProfile(prev => prev ? { ...prev, videoCallRate: e.target.value ? Number(e.target.value) : null } : null)}
                  placeholder="Rate for video consultations"
                  min={0}
                />
              </div>

              <Textarea
                label="Clinic Hours"
                value={vetProfile?.hours || ''}
                onChange={(e) => setVetProfile(prev => prev ? { ...prev, hours: e.target.value } : null)}
                placeholder="e.g., Mon-Fri: 9am-6pm, Sat: 10am-2pm"
                rows={2}
              />

              <Input
                label="License Number"
                value={vetProfile?.license || ''}
                onChange={(e) => setVetProfile(prev => prev ? { ...prev, license: e.target.value } : null)}
                placeholder="Your veterinary license number"
              />

              <Textarea
                label="Specializations"
                value={vetProfile?.specializations || ''}
                onChange={(e) => setVetProfile(prev => prev ? { ...prev, specializations: e.target.value } : null)}
                placeholder="e.g., Small animals, Surgery, Dermatology"
                rows={2}
              />

              <Textarea
                label="Services Offered"
                value={vetProfile?.services || ''}
                onChange={(e) => setVetProfile(prev => prev ? { ...prev, services: e.target.value } : null)}
                placeholder="e.g., General checkup, Vaccinations, Surgery, Dental care"
                rows={2}
              />
            </div>
          </div>

          {/* Address Form */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Personal Address</h3>
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
            placeholder="Tell pet owners about yourself and your practice..."
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
