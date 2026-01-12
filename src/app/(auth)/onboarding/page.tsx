'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { LoadingSpinner } from '@/components/ui/Loading'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { AddressForm } from '@/components/ui/AddressForm'

type Step = 'profile' | 'aadhaar' | 'pet' | 'complete'

const speciesOptions = [
  { value: 'dog', label: 'Dog', icon: '🐕' },
  { value: 'cat', label: 'Cat', icon: '🐈' },
  { value: 'bird', label: 'Bird', icon: '🐦' },
  { value: 'rabbit', label: 'Rabbit', icon: '🐰' },
  { value: 'hamster', label: 'Hamster', icon: '🐹' },
  { value: 'fish', label: 'Fish', icon: '🐟' },
  { value: 'other', label: 'Other', icon: '🐾' },
]

export default function OnboardingPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<Step>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Profile data
  const [profile, setProfile] = useState({
    name: '',
    countryCode: '+91',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
    googleMapsLink: '',
    bio: '',
    avatar: '',
  })

  // Aadhaar data
  const [aadhaar, setAadhaar] = useState({
    number: '',
    image: '',
  })

  // Pet data (for owners)
  const [pet, setPet] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    photo: '',
    medicalNotes: '',
  })

  // Get pending role from localStorage (saved during signup)
  const [pendingRole, setPendingRole] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('pawzr_signup_role')
      setPendingRole(role)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.name) {
      setProfile(prev => ({ ...prev, name: session.user.name || '' }))
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signup')
    }
  }, [status, router])

  const userRole = pendingRole || session?.user?.role

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Update user profile
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          role: pendingRole || session?.user?.role,
          profileComplete: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update profile')
        setIsLoading(false)
        return
      }

      // Update session with name AND role
      await update({ name: profile.name, role: pendingRole || session?.user?.role })

      // Clear pending role
      localStorage.removeItem('pawzr_signup_role')

      // Go to Aadhaar step for OWNER and LOVER roles
      if (userRole === 'OWNER' || userRole === 'LOVER') {
        setStep('aadhaar')
      } else {
        setStep('complete')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAadhaarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate Aadhaar number
    if (aadhaar.number && aadhaar.number.length !== 12) {
      setError('Aadhaar number must be 12 digits')
      return
    }

    if (aadhaar.number && !/^\d{12}$/.test(aadhaar.number)) {
      setError('Aadhaar number must contain only digits')
      return
    }

    if (aadhaar.number && !aadhaar.image) {
      setError('Please upload your Aadhaar card image')
      return
    }

    setIsLoading(true)

    try {
      // Submit Aadhaar if provided
      if (aadhaar.number && aadhaar.image) {
        const res = await fetch('/api/users/me/aadhaar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aadhaarNumber: aadhaar.number,
            aadhaarImage: aadhaar.image,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Failed to submit Aadhaar')
          setIsLoading(false)
          return
        }
      }

      // Go to pet step for owners, otherwise complete
      if (userRole === 'OWNER') {
        setStep('pet')
      } else {
        setStep('complete')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const skipAadhaar = () => {
    if (userRole === 'OWNER') {
      setStep('pet')
    } else {
      setStep('complete')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pet.name,
          species: pet.species,
          breed: pet.breed || null,
          age: pet.age ? parseInt(pet.age) : null,
          photo: pet.photo || null,
          medicalNotes: pet.medicalNotes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to add pet')
        setIsLoading(false)
        return
      }

      setStep('complete')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const skipPet = () => {
    setStep('complete')
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleAadhaarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12)
    setAadhaar({ ...aadhaar, number: value })
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Progress indicator - calculate total steps based on role
  const getTotalSteps = () => {
    if (userRole === 'OWNER') return 4 // profile -> aadhaar -> pet -> complete
    if (userRole === 'LOVER') return 3 // profile -> aadhaar -> complete
    return 2 // profile -> complete
  }

  const getCurrentStepNumber = () => {
    switch (step) {
      case 'profile': return 1
      case 'aadhaar': return 2
      case 'pet': return 3
      case 'complete': return getTotalSteps()
      default: return 1
    }
  }

  const totalSteps = getTotalSteps()
  const currentStep = getCurrentStepNumber()

  return (
    <div className="w-full max-w-lg">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-600">
            {step === 'profile' && 'Your Profile'}
            {step === 'aadhaar' && 'Verify Identity'}
            {step === 'pet' && 'Add Your Pet'}
            {step === 'complete' && 'All Done!'}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Profile Step */}
      {step === 'profile' && (
        <Card variant="elevated">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-1">Tell us a bit about yourself</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <ImageUpload
              currentImage={profile.avatar}
              onUpload={(url) => setProfile({ ...profile, avatar: url })}
              label="Profile Photo"
            />

            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="John Doe"
              required
            />

            <PhoneInput
              label="Phone Number"
              countryCode={profile.countryCode}
              phone={profile.phone}
              onCountryCodeChange={(code) => setProfile({ ...profile, countryCode: code })}
              onPhoneChange={(phone) => setProfile({ ...profile, phone })}
            />

            <AddressForm
              address={{
                addressLine1: profile.addressLine1,
                addressLine2: profile.addressLine2,
                landmark: profile.landmark,
                city: profile.city,
                state: profile.state,
                country: profile.country,
                zipCode: profile.zipCode,
                latitude: profile.latitude,
                longitude: profile.longitude,
                googleMapsLink: profile.googleMapsLink,
              }}
              onChange={(addressData) => setProfile({ ...profile, ...addressData })}
              showLocationPicker={true}
            />

            <Textarea
              label="Bio (optional)"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Continue
            </Button>
          </form>
        </Card>
      )}

      {/* Aadhaar Step (Owners and Lovers) */}
      {step === 'aadhaar' && (
        <Card variant="elevated">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🪪</div>
            <h1 className="text-2xl font-bold text-gray-900">Verify Your Identity</h1>
            <p className="text-gray-600 mt-1">Get a verified badge on your profile</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAadhaarSubmit} className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-medium text-blue-900">Why verify?</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>Get a verified badge on your profile</li>
                    <li>Build trust with other users</li>
                    <li>Access premium features</li>
                  </ul>
                </div>
              </div>
            </div>

            <Input
              label="Aadhaar Number"
              type="text"
              value={aadhaar.number}
              onChange={handleAadhaarNumberChange}
              placeholder="Enter 12-digit Aadhaar number"
              maxLength={12}
            />
            <p className="text-xs text-gray-500 -mt-2">
              {aadhaar.number.length}/12 digits
            </p>

            <ImageUpload
              currentImage={aadhaar.image}
              onUpload={(url) => setAadhaar({ ...aadhaar, image: url })}
              label="Upload Aadhaar Card (Front)"
            />

            <p className="text-xs text-gray-500">
              Your Aadhaar details are kept confidential and used only for verification.
            </p>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!aadhaar.number && !aadhaar.image}
              >
                {aadhaar.number || aadhaar.image ? 'Submit & Continue' : 'Continue'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={skipAadhaar}>
                Skip for now
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Pet Step (Owners only) */}
      {step === 'pet' && (
        <Card variant="elevated">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🐾</div>
            <h1 className="text-2xl font-bold text-gray-900">Add Your First Pet</h1>
            <p className="text-gray-600 mt-1">Let&apos;s get to know your furry friend</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handlePetSubmit} className="space-y-4">
            <ImageUpload
              currentImage={pet.photo}
              onUpload={(url) => setPet({ ...pet, photo: url })}
              label="Pet Photo"
            />

            <Input
              label="Pet Name"
              value={pet.name}
              onChange={(e) => setPet({ ...pet, name: e.target.value })}
              placeholder="Buddy"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species
              </label>
              <div className="grid grid-cols-4 gap-2">
                {speciesOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPet({ ...pet, species: option.value })}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      pet.species === option.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-xs text-gray-600">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Breed (optional)"
              value={pet.breed}
              onChange={(e) => setPet({ ...pet, breed: e.target.value })}
              placeholder="Golden Retriever"
            />

            <Input
              label="Age (years)"
              type="number"
              value={pet.age}
              onChange={(e) => setPet({ ...pet, age: e.target.value })}
              placeholder="3"
              min="0"
              max="30"
            />

            <Textarea
              label="Medical Notes (optional)"
              value={pet.medicalNotes}
              onChange={(e) => setPet({ ...pet, medicalNotes: e.target.value })}
              placeholder="Any allergies, conditions, or special needs..."
              rows={2}
            />

            <div className="space-y-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Add Pet & Continue
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={skipPet}>
                Skip for now
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <Card variant="elevated" className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h1>
          <p className="text-gray-600 mb-6">Welcome to Pawzr. Redirecting to your dashboard...</p>
          <LoadingSpinner />
        </Card>
      )}
    </div>
  )
}
