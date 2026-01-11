'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  endDate: string | null
  location: string
  address: string | null
  city: string | null
  image: string | null
  featured: boolean
  maxAttendees: number | null
  _count: { rsvps: number }
  hasRsvped: boolean
}

export default function EventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) setEvents(await res.json())
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRsvp = async (eventId: string) => {
    if (!session) {
      window.location.href = '/login?callbackUrl=/events'
      return
    }

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST' })
      if (res.ok) fetchEvents()
    } catch (error) {
      console.error('RSVP failed:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Pet Community Events</h1>
          <p className="text-gray-600 mt-2">Join local pet meetups, adoption drives, and community events</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">No upcoming events. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover -m-6 mb-4 w-[calc(100%+3rem)]" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 -m-6 mb-4 w-[calc(100%+3rem)] flex items-center justify-center">
                    <span className="text-white text-4xl">🐾</span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold">{event.title}</h2>
                  {event.featured && <Badge variant="warning">Featured</Badge>}
                </div>

                <p className="text-sm text-orange-600 mt-2">{formatDate(event.date)}</p>
                <p className="text-sm text-gray-500">{event.location}{event.city && `, ${event.city}`}</p>

                {event.description && (
                  <p className="text-gray-600 mt-3 line-clamp-2">{event.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {event._count.rsvps} attending
                    {event.maxAttendees && ` / ${event.maxAttendees} max`}
                  </span>
                  <Button
                    size="sm"
                    variant={event.hasRsvped ? 'outline' : 'primary'}
                    onClick={() => handleRsvp(event.id)}
                  >
                    {event.hasRsvped ? 'Cancel RSVP' : 'RSVP'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
