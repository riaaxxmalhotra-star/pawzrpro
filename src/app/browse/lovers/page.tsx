'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { StarRating } from '@/components/shared/StarRating'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import { formatCurrency, serviceTypeDisplayNames } from '@/lib/utils'

interface Provider {
  id: string
  name: string
  avatar?: string
  bio?: string
  city?: string
  aadhaarVerified?: boolean
  loverProfile?: {
    experience?: string
    hourlyRate?: number
    serviceRadius?: number
  }
  services: {
    id: string
    type: string
    name: string
    price: number
    duration: number
  }[]
  averageRating: number
  reviewCount: number
}

const serviceTypeOptions = [
  { value: '', label: 'All Services' },
  { value: 'WALKING', label: 'Dog Walking' },
  { value: 'SITTING', label: 'Pet Sitting' },
  { value: 'BOARDING', label: 'Pet Boarding' },
]

export default function BrowseLoversPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceType, setServiceType] = useState('')

  useEffect(() => {
    fetchProviders()
  }, [serviceType])

  const fetchProviders = async () => {
    try {
      const params = new URLSearchParams()
      if (serviceType) params.set('type', serviceType)

      const response = await fetch(`/api/browse/lovers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProviders(data)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getLowestPrice = (services: Provider['services']) => {
    if (services.length === 0) return null
    return Math.min(...services.map((s) => s.price))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Find Pet Lovers</h1>
          <p className="text-pink-100">Discover trusted walkers, sitters, and pet care providers near you</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-64"
          />
          <Select
            options={serviceTypeOptions}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="sm:w-48"
          />
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {filteredProviders.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <CardContent>
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-600">
                {searchQuery || serviceType
                  ? 'Try adjusting your search filters'
                  : 'Be the first pet lover to join Pawzr!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Link key={provider.id} href={`/browse/lovers/${provider.id}`}>
                <Card variant="bordered" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar src={provider.avatar} name={provider.name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate flex items-center gap-1">
                          {provider.name}
                          {provider.aadhaarVerified && <VerifiedBadge size="sm" />}
                        </h3>
                        {provider.city && (
                          <p className="text-sm text-gray-500">{provider.city}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={provider.averageRating} size="sm" />
                          <span className="text-sm text-gray-500">
                            ({provider.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>

                    {provider.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{provider.bio}</p>
                    )}

                    {provider.services.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[...new Set(provider.services.map((s) => s.type))].map((type) => (
                          <Badge key={type} variant="default" size="sm">
                            {serviceTypeDisplayNames[type]}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {getLowestPrice(provider.services) && (
                        <p className="text-sm">
                          <span className="text-gray-500">From </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(getLowestPrice(provider.services)!)}
                          </span>
                        </p>
                      )}
                      <Button size="sm">View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
