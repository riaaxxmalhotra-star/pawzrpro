'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/Loading'

interface Booking {
  id: string
  date: string
  time: string
  duration: number
  status: string
  price: number
  notes: string | null
  owner: { id: string; name: string; avatar: string | null }
  pet: { name: string; species: string; breed: string | null } | null
}

const statusColors: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  PENDING: 'warning', ACCEPTED: 'info', COMPLETED: 'success', CANCELLED: 'error', DECLINED: 'error',
}

export default function GroomerAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      if (res.ok) setBookings(await res.json())
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchBookings()
    } catch (error) {
      console.error('Failed to update booking:', error)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

  const pending = bookings.filter((b) => b.status === 'PENDING')
  const upcoming = bookings.filter((b) => b.status === 'ACCEPTED')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Pending Requests ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map((booking) => (
              <Card key={booking.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar src={booking.owner.avatar} alt={booking.owner.name || ''} size="md" />
                    <div>
                      <h3 className="font-semibold">{booking.owner.name}</h3>
                      {booking.pet && <p className="text-sm text-gray-500">{booking.pet.name} ({booking.pet.species})</p>}
                    </div>
                  </div>
                  <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Date</p><p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p></div>
                  <div><p className="text-gray-500">Time</p><p className="font-medium">{booking.time}</p></div>
                  <div><p className="text-gray-500">Price</p><p className="font-medium">${booking.price}</p></div>
                </div>
                {booking.notes && <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">{booking.notes}</p>}
                <div className="mt-4 flex gap-3">
                  <Button onClick={() => updateStatus(booking.id, 'ACCEPTED')} size="sm">Accept</Button>
                  <Button onClick={() => updateStatus(booking.id, 'DECLINED')} variant="outline" size="sm">Decline</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <Card className="text-center py-8"><p className="text-gray-500">No upcoming appointments</p></Card>
        ) : (
          <div className="space-y-4">
            {upcoming.map((booking) => (
              <Card key={booking.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar src={booking.owner.avatar} alt={booking.owner.name || ''} size="md" />
                    <div>
                      <h3 className="font-semibold">{booking.owner.name}</h3>
                      {booking.pet && <p className="text-sm text-gray-500">{booking.pet.name}</p>}
                      <p className="text-sm text-orange-600">{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => updateStatus(booking.id, 'COMPLETED')}>Mark Complete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
