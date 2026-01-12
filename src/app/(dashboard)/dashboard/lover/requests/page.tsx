'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/Loading'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'

interface Booking {
  id: string
  date: string
  time: string
  duration: number
  status: string
  price: number
  notes: string | null
  owner: { id: string; name: string; avatar: string | null; aadhaarVerified: boolean }
  pet: { name: string; species: string } | null
  service: { name: string } | null
}

export default function RequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings?status=PENDING')
      if (res.ok) setBookings(await res.json())
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) fetchBookings()
    } catch (error) {
      console.error('Failed to update booking:', error)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Booking Requests</h1>

      {bookings.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No pending requests</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar src={booking.owner.avatar} name={booking.owner.name || ''} size="md" />
                  <div>
                    <h3 className="font-semibold flex items-center gap-1">
                      {booking.owner.name}
                      {booking.owner.aadhaarVerified && <VerifiedBadge size="sm" />}
                    </h3>
                    {booking.pet && <p className="text-sm text-gray-500">{booking.pet.name} ({booking.pet.species})</p>}
                    {booking.service && <Badge variant="default" size="sm">{booking.service.name}</Badge>}
                  </div>
                </div>
                <Badge variant="warning">{booking.status}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium">{booking.time}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">{booking.duration} min</p>
                </div>
              </div>

              {booking.notes && (
                <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">{booking.notes}</p>
              )}

              <div className="mt-4 flex gap-3">
                <Button onClick={() => updateStatus(booking.id, 'ACCEPTED')} size="sm">Accept</Button>
                <Button onClick={() => updateStatus(booking.id, 'DECLINED')} variant="outline" size="sm">Decline</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
