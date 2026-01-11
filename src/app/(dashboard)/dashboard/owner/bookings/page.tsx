'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatDate, formatCurrency, bookingStatusColors } from '@/lib/utils'

interface Booking {
  id: string
  date: string
  time: string
  duration: number
  status: string
  price: number
  notes?: string
  provider: {
    id: string
    name: string
    avatar?: string
  }
  pet?: {
    id: string
    name: string
    species: string
  }
  service?: {
    name: string
    type: string
  }
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filter === 'upcoming') {
      return bookingDate >= today && !['CANCELLED', 'COMPLETED', 'DECLINED'].includes(booking.status)
    }
    if (filter === 'past') {
      return bookingDate < today || ['CANCELLED', 'COMPLETED', 'DECLINED'].includes(booking.status)
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      PENDING: 'warning',
      ACCEPTED: 'success',
      DECLINED: 'danger',
      CANCELLED: 'default',
      COMPLETED: 'info',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">View and manage your service bookings</p>
        </div>
        <Link href="/browse/lovers">
          <Button>Book a Service</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['upcoming', 'past', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CardContent>
            <p className="text-5xl mb-4">📅</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} bookings
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'upcoming'
                ? 'Book a walker, vet, or groomer to get started!'
                : 'Your booking history will appear here.'}
            </p>
            {filter === 'upcoming' && (
              <Link href="/browse/lovers">
                <Button>Find Services</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} variant="bordered">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={booking.provider.avatar}
                    name={booking.provider.name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.service?.name || 'Service'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          with {booking.provider.name}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.time} ({booking.duration} min)
                      </span>
                      {booking.pet && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {booking.pet.name}
                        </span>
                      )}
                      <span className="font-medium text-gray-900">
                        {formatCurrency(booking.price)}
                      </span>
                    </div>

                    {booking.notes && (
                      <p className="mt-2 text-sm text-gray-500 italic">
                        &quot;{booking.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {booking.status === 'PENDING' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <Button variant="outline" size="sm">
                      Cancel Booking
                    </Button>
                    <Button variant="ghost" size="sm">
                      Message Provider
                    </Button>
                  </div>
                )}

                {booking.status === 'COMPLETED' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <Button variant="outline" size="sm">
                      Leave Review
                    </Button>
                    <Button variant="ghost" size="sm">
                      Book Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
