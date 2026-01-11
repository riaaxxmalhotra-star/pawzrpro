'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
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
    specializations: string | null
    videoCallRate: number | null
  } | null
  averageRating: number
  reviewCount: number
}

export default function BrowseVetsPage() {
  const [vets, setVets] = useState<Vet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')

  useEffect(() => {
    fetchVets()
  }, [])

  const fetchVets = async (city?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (city) params.append('city', city)

      const res = await fetch(`/api/browse/vets?${params}`)
      if (res.ok) {
        const data = await res.json()
        setVets(data)
      }
    } catch (error) {
      console.error('Failed to fetch vets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVets(searchCity)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Veterinarian</h1>
          <p className="text-gray-600 mt-2">Book appointments with licensed veterinarians</p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-4">
            <Input
              placeholder="Search by city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : vets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">No veterinarians found. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((vet) => (
              <Card key={vet.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={vet.avatar}
                    name={vet.name || 'Vet'}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{vet.name}</h3>
                    {vet.vetProfile?.clinicName && (
                      <p className="text-orange-600 text-sm">{vet.vetProfile.clinicName}</p>
                    )}
                    {vet.city && (
                      <p className="text-gray-500 text-sm">{vet.city}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <StarRating rating={vet.averageRating} size="sm" />
                  <span className="text-sm text-gray-500">
                    ({vet.reviewCount} reviews)
                  </span>
                </div>

                {vet.vetProfile?.specializations && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {vet.vetProfile.specializations.split(',').slice(0, 3).map((spec, i) => (
                      <Badge key={i} variant="default" size="sm">
                        {spec.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                {vet.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{vet.bio}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  {vet.vetProfile?.videoCallRate && (
                    <span className="text-sm font-medium text-gray-900">
                      ${vet.vetProfile.videoCallRate}/video call
                    </span>
                  )}
                  <Link href={`/browse/vets/${vet.id}`}>
                    <Button size="sm">View Profile</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
