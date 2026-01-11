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

type Step = 'profile' | 'pet' | 'complete'

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
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    bio: '',
    avatar: '',
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

  // Get pending role from localStorage
  const [pendingRole, setPendingRole] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('pendingRole')
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

      // Update session
      await update({ name: profile.name })

      // Clear pending role
      localStorage.removeItem('pendingRole')

      // If owner, go to pet step, otherwise complete
      const userRole = pendingRole || session?.user?.role
      if (userRole === 'OWNER') {
        setStep('pet')
      } else {
        setStep('complete')
        // Redirect to dashboard after a moment
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
      // Redirect to dashboard after a moment
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

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Progress indicator
  const userRole = pendingRole || session?.user?.role
  const totalSteps = userRole === 'OWNER' ? 3 : 2
  const currentStep = step === 'profile' ? 1 : step === 'pet' ? 2 : totalSteps

  return (
    <div className="w-full max-w-lg">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-600">
            {step === 'profile' && 'Your Profile'}
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

            <Input
              label="Phone Number"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+91 9876543210"
            />

            <Input
              label="Address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Street address"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Mumbai"
              />
              <Input
                label="PIN Code"
                value={profile.zipCode}
                onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                placeholder="400001"
              />
            </div>

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
