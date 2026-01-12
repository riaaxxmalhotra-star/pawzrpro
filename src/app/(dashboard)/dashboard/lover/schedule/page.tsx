'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Calendar } from '@/components/ui/Calendar'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'

interface Booking {
  id: string
  date: string
  time: string
  status: string
  notes: string | null
  owner: {
    name: string
    phone: string | null
  }
  pet: {
    name: string
    species: string
  } | null
  service: {
    name: string
    type: string
  } | null
}

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  status: string
  clientName?: string
  petName?: string
}

export default function LoverSchedulePage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'pending'>('upcoming')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Convert bookings to calendar events
  const calendarEvents: CalendarEvent[] = bookings
    .filter(booking => {
      if (filter === 'upcoming') {
        return new Date(booking.date) >= new Date() && booking.status !== 'CANCELLED'
      }
      if (filter === 'pending') {
        return booking.status === 'PENDING'
      }
      return true
    })
    .map(booking => ({
      id: booking.id,
      title: booking.service?.name || 'Pet Care',
      date: new Date(booking.date),
      time: booking.time,
      status: booking.status,
      clientName: booking.owner.name,
      petName: booking.pet?.name || 'Pet',
    }))

  const handleEventClick = (event: CalendarEvent) => {
    const booking = bookings.find(b => b.id === event.id)
    if (booking) {
      setSelectedBooking(booking)
    }
  }

  const upcomingCount = bookings.filter(
    b => new Date(b.date) >= new Date() && b.status === 'ACCEPTED'
  ).length

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length

  const todayBookings = bookings.filter(b => {
    const today = new Date()
    const bookingDate = new Date(b.date)
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear() &&
      b.status === 'ACCEPTED'
    )
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600">Manage your bookings and appointments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayBookings.length}</p>
              <p className="text-sm text-gray-600">Today</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'pending', label: 'Pending' },
          { key: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <Calendar
        events={calendarEvents}
        onEventClick={handleEventClick}
      />

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {selectedBooking.pet?.species === 'dog' ? '🐕' :
                     selectedBooking.pet?.species === 'cat' ? '🐈' : '🐾'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedBooking.pet?.name || 'Pet'}</p>
                    <p className="text-sm text-gray-600">{selectedBooking.pet?.species}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client</span>
                    <span className="font-medium">{selectedBooking.owner.name}</span>
                  </div>
                  {selectedBooking.owner.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      <a href={`tel:${selectedBooking.owner.phone}`} className="font-medium text-orange-600">
                        {selectedBooking.owner.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {new Date(selectedBooking.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">{selectedBooking.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium">{selectedBooking.service?.name || 'Pet Care'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      selectedBooking.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      selectedBooking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedBooking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-gray-900">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4 flex gap-2">
                  {selectedBooking.status === 'PENDING' && (
                    <Button
                      onClick={() => router.push('/dashboard/lover/requests')}
                      className="flex-1"
                    >
                      View Requests
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
