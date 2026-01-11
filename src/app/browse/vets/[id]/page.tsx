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

interface Vet {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  city: string | null
  vetProfile: {
    clinicName: string | null
    clinicAddress: string | null
    clinicPhone: string | null
    hours: string | null
    specializations: string | null
    services: string | null
    videoCallRate: number | null
  } | null
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

export default function VetProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [vet, setVet] = useState<Vet | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchVet(params.id as string)
    }
  }, [params.id])

  const fetchVet = async (id: string) => {
    try {
      const res = await fetch(`/api/browse/vets/${id}`)
      if (res.ok) {
        const data = await res.json()
        setVet(data)
      } else {
        router.push('/browse/vets')
      }
    } catch (error) {
      console.error('Failed to fetch vet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = () => {
    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(`/browse/vets/${params.id}`))
      return
    }
    router.push(`/book?provider=${params.id}&type=VET`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!vet) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <p className="text-gray-500">Veterinarian not found</p>
          <Link href="/browse/vets">
            <Button className="mt-4">Back to Browse</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/browse/vets" className="text-orange-600 hover:underline mb-4 inline-block">
          &larr; Back to Veterinarians
        </Link>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar src={vet.avatar} name={vet.name || 'Vet'} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{vet.name}</h1>
              {vet.vetProfile?.clinicName && (
                <p className="text-orange-600 font-medium">{vet.vetProfile.clinicName}</p>
              )}
              {vet.city && <p className="text-gray-500">{vet.city}</p>}
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={vet.averageRating} />
                <span className="text-gray-600">
                  {vet.averageRating.toFixed(1)} ({vet.reviewCount} reviews)
                </span>
              </div>
              {vet.vetProfile?.videoCallRate && (
                <p className="text-lg font-semibold text-orange-600 mt-2">
                  ${vet.vetProfile.videoCallRate} per video consultation
                </p>
              )}
            </div>
            <div>
              <Button onClick={handleBooking}>Book Appointment</Button>
            </div>
          </div>

          {vet.bio && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-gray-600">{vet.bio}</p>
            </div>
          )}

          {vet.vetProfile?.clinicAddress && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Clinic Address</h2>
              <p className="text-gray-600">{vet.vetProfile.clinicAddress}</p>
            </div>
          )}

          {vet.vetProfile?.clinicPhone && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Phone</h2>
              <p className="text-gray-600">{vet.vetProfile.clinicPhone}</p>
            </div>
          )}

          {vet.vetProfile?.specializations && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {vet.vetProfile.specializations.split(',').map((spec, i) => (
                  <Badge key={i} variant="success">{spec.trim()}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {vet.reviews.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {vet.reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar src={review.reviewer.avatar} name={review.reviewer.name || ''} size="sm" />
                    <div>
                      <p className="font-medium">{review.reviewer.name}</p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
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
