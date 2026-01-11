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

interface Groomer {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  city: string | null
  groomerProfile: {
    salonName: string | null
    services: string | null
  } | null
  averageRating: number
  reviewCount: number
}

export default function BrowseGroomersPage() {
  const [groomers, setGroomers] = useState<Groomer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')

  useEffect(() => {
    fetchGroomers()
  }, [])

  const fetchGroomers = async (city?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (city) params.append('city', city)

      const res = await fetch(`/api/browse/groomers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setGroomers(data)
      }
    } catch (error) {
      console.error('Failed to fetch groomers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGroomers(searchCity)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Groomer</h1>
          <p className="text-gray-600 mt-2">Professional grooming services for your pet</p>

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
        ) : groomers.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">No groomers found. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groomers.map((groomer) => (
              <Card key={groomer.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={groomer.avatar}
                    alt={groomer.name || 'Groomer'}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{groomer.name}</h3>
                    {groomer.groomerProfile?.salonName && (
                      <p className="text-orange-600 text-sm">{groomer.groomerProfile.salonName}</p>
                    )}
                    {groomer.city && (
                      <p className="text-gray-500 text-sm">{groomer.city}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <StarRating rating={groomer.averageRating} size="sm" />
                  <span className="text-sm text-gray-500">
                    ({groomer.reviewCount} reviews)
                  </span>
                </div>

                {groomer.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{groomer.bio}</p>
                )}

                <div className="mt-4 flex justify-end">
                  <Link href={`/browse/groomers/${groomer.id}`}>
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
