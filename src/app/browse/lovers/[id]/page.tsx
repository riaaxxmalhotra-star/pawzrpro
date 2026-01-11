'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Loading'
import { StarRating } from '@/components/shared/StarRating'
import Link from 'next/link'

interface Service {
  id: string
  type: string
  name: string
  description: string | null
  price: number
  duration: number
}

interface Provider {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  city: string | null
  loverProfile: {
    experience: string | null
    certifications: string | null
    hourlyRate: number | null
  } | null
  services: Service[]
  averageRating: number
  reviewCount: number
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    createdAt: string
    reviewer: { name: string; avatar: string | null }
  }>
}

export default function LoverProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProvider(params.id as string)
    }
  }, [params.id])

  const fetchProvider = async (id: string) => {
    try {
      const res = await fetch(`/api/browse/lovers/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProvider(data)
      } else {
        router.push('/browse/lovers')
      }
    } catch (error) {
      console.error('Failed to fetch provider:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = (serviceId?: string) => {
    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(`/browse/lovers/${params.id}`))
      return
    }
    router.push(`/book?provider=${params.id}&type=LOVER${serviceId ? `&service=${serviceId}` : ''}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <p className="text-gray-500">Provider not found</p>
          <Link href="/browse/lovers">
            <Button className="mt-4">Back to Browse</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/browse/lovers" className="text-orange-600 hover:underline mb-4 inline-block">
          &larr; Back to Pet Lovers
        </Link>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar
              src={provider.avatar}
              alt={provider.name || 'Provider'}
              size="xl"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              {provider.city && (
                <p className="text-gray-500">{provider.city}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={provider.averageRating} />
                <span className="text-gray-600">
                  {provider.averageRating.toFixed(1)} ({provider.reviewCount} reviews)
                </span>
              </div>
              {provider.loverProfile?.hourlyRate && (
                <p className="text-lg font-semibold text-orange-600 mt-2">
                  ${provider.loverProfile.hourlyRate}/hour
                </p>
              )}
            </div>
            <div>
              <Button onClick={() => handleBooking()}>Book Now</Button>
            </div>
          </div>

          {provider.bio && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-gray-600">{provider.bio}</p>
            </div>
          )}

          {provider.loverProfile?.experience && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Experience</h2>
              <p className="text-gray-600">{provider.loverProfile.experience}</p>
            </div>
          )}

          {provider.loverProfile?.certifications && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Certifications</h2>
              <div className="flex flex-wrap gap-2">
                {provider.loverProfile.certifications.split(',').map((cert, i) => (
                  <Badge key={i} variant="success">{cert.trim()}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {provider.services.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <div className="space-y-4">
              {provider.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{service.name}</h3>
                      <Badge variant="secondary" size="sm">{service.type}</Badge>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{service.duration} minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${service.price}</p>
                    <Button size="sm" onClick={() => handleBooking(service.id)} className="mt-2">
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {provider.reviews.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {provider.reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={review.reviewer.avatar}
                      alt={review.reviewer.name || 'Reviewer'}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium">{review.reviewer.name}</p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
