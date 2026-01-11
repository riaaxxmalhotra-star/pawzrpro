'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Loading'
import { StarRating } from '@/components/shared/StarRating'
import Link from 'next/link'

interface Groomer {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  city: string | null
  groomerProfile: {
    salonName: string | null
    salonAddress: string | null
    salonPhone: string | null
    hours: string | null
    services: string | null
  } | null
  averageRating: number
  reviewCount: number
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    reviewer: { name: string; avatar: string | null }
  }>
}

export default function GroomerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [groomer, setGroomer] = useState<Groomer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) fetchGroomer(params.id as string)
  }, [params.id])

  const fetchGroomer = async (id: string) => {
    try {
      const res = await fetch(`/api/browse/groomers/${id}`)
      if (res.ok) setGroomer(await res.json())
      else router.push('/browse/groomers')
    } catch (error) {
      console.error('Failed to fetch groomer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = () => {
    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(`/browse/groomers/${params.id}`))
      return
    }
    router.push(`/book?provider=${params.id}&type=GROOMER`)
  }

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>

  if (!groomer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <p className="text-gray-500">Groomer not found</p>
          <Link href="/browse/groomers"><Button className="mt-4">Back to Browse</Button></Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/browse/groomers" className="text-orange-600 hover:underline mb-4 inline-block">&larr; Back to Groomers</Link>
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar src={groomer.avatar} name={groomer.name || 'Groomer'} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{groomer.name}</h1>
              {groomer.groomerProfile?.salonName && <p className="text-orange-600 font-medium">{groomer.groomerProfile.salonName}</p>}
              {groomer.city && <p className="text-gray-500">{groomer.city}</p>}
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={groomer.averageRating} />
                <span className="text-gray-600">{groomer.averageRating.toFixed(1)} ({groomer.reviewCount} reviews)</span>
              </div>
            </div>
            <div><Button onClick={handleBooking}>Book Appointment</Button></div>
          </div>
          {groomer.bio && <div className="mt-6"><h2 className="font-semibold mb-2">About</h2><p className="text-gray-600">{groomer.bio}</p></div>}
          {groomer.groomerProfile?.salonAddress && <div className="mt-4"><h2 className="font-semibold mb-2">Address</h2><p className="text-gray-600">{groomer.groomerProfile.salonAddress}</p></div>}
        </Card>
        {groomer.reviews.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {groomer.reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar src={review.reviewer.avatar} name={review.reviewer.name || ''} size="sm" />
                    <div><p className="font-medium">{review.reviewer.name}</p><StarRating rating={review.rating} size="sm" /></div>
                  </div>
                  {review.comment && <p className="text-gray-600 mt-2">{review.comment}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
