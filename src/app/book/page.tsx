'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Loading'

interface Pet {
  id: string
  name: string
  species: string
}

function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const providerId = searchParams.get('provider')
  const providerType = searchParams.get('type') || 'LOVER'
  const serviceId = searchParams.get('service')

  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    petId: '',
    date: '',
    time: '',
    duration: 60,
    notes: '',
  })

  useEffect(() => {
    if (session) fetchPets()
  }, [session])

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets')
      if (res.ok) {
        const data = await res.json()
        setPets(data)
        if (data.length > 0) setFormData((prev) => ({ ...prev, petId: data[0].id }))
      }
    } catch (error) {
      console.error('Failed to fetch pets:', error)
    }
  }

  if (!session) {
    router.push('/login?callbackUrl=' + encodeURIComponent(`/book?provider=${providerId}&type=${providerType}`))
    return null
  }

  if (!providerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <h1 className="text-xl font-bold mb-2">No provider selected</h1>
          <p className="text-gray-500 mb-4">Please select a service provider first</p>
          <Button onClick={() => router.push('/browse/lovers')}>Browse Providers</Button>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          providerType,
          serviceId,
          ...formData,
          price: 50, // This would normally come from the service
        }),
      })

      if (res.ok) {
        router.push('/dashboard/owner/bookings?success=true')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {pets.length > 0 && (
              <Select
                label="Select Pet"
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                options={pets.map((pet) => ({ value: pet.id, label: `${pet.name} (${pet.species})` }))}
              />
            )}

            <Input
              label="Date"
              type="date"
              min={minDate}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Select
              label="Time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              options={[
                { value: '09:00', label: '9:00 AM' },
                { value: '10:00', label: '10:00 AM' },
                { value: '11:00', label: '11:00 AM' },
                { value: '12:00', label: '12:00 PM' },
                { value: '13:00', label: '1:00 PM' },
                { value: '14:00', label: '2:00 PM' },
                { value: '15:00', label: '3:00 PM' },
                { value: '16:00', label: '4:00 PM' },
                { value: '17:00', label: '5:00 PM' },
              ]}
            />

            <Select
              label="Duration"
              value={formData.duration.toString()}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              options={[
                { value: '30', label: '30 minutes' },
                { value: '60', label: '1 hour' },
                { value: '120', label: '2 hours' },
                { value: '240', label: '4 hours' },
              ]}
            />

            <Textarea
              label="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions or requirements..."
              rows={3}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Request Booking
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
      <BookingForm />
    </Suspense>
  )
}
