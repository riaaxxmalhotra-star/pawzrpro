'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'

interface Provider {
  id: string
  name: string
  email: string
  phone: string
  role: 'VET' | 'GROOMER' | 'SUPPLIER' | 'LOVER'
  businessName?: string
  verified: boolean
  aadhaarVerified: boolean
  rating: number
  totalBookings: number
  totalRevenue: number
  city: string
  createdAt: string
}

// Mock providers data
const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Dr. Sarah Sharma',
    email: 'sarah@vetclinic.com',
    phone: '+91 98765 43210',
    role: 'VET',
    businessName: 'Sarah Pet Clinic',
    verified: true,
    aadhaarVerified: true,
    rating: 4.9,
    totalBookings: 156,
    totalRevenue: 78000,
    city: 'Bangalore',
    createdAt: '2025-06-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'PetSpa Studio',
    email: 'info@petspa.com',
    phone: '+91 87654 32109',
    role: 'GROOMER',
    businessName: 'PetSpa Studio',
    verified: true,
    aadhaarVerified: true,
    rating: 4.7,
    totalBookings: 89,
    totalRevenue: 53400,
    city: 'Bangalore',
    createdAt: '2025-07-20T14:00:00Z',
  },
  {
    id: '3',
    name: 'Pet Paradise Store',
    email: 'shop@petparadise.com',
    phone: '+91 76543 21098',
    role: 'SUPPLIER',
    businessName: 'Pet Paradise',
    verified: true,
    aadhaarVerified: false,
    rating: 4.8,
    totalBookings: 0,
    totalRevenue: 127800,
    city: 'Mumbai',
    createdAt: '2025-08-10T11:00:00Z',
  },
  {
    id: '4',
    name: 'Rahul Pet Walker',
    email: 'rahul@pawzr.com',
    phone: '+91 65432 10987',
    role: 'LOVER',
    verified: false,
    aadhaarVerified: false,
    rating: 4.5,
    totalBookings: 34,
    totalRevenue: 17000,
    city: 'Bangalore',
    createdAt: '2025-09-01T09:00:00Z',
  },
]

export default function AdminProvidersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>(mockProviders)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-login')
    }
  }, [status, router])

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(search.toLowerCase()) ||
      provider.email.toLowerCase().includes(search.toLowerCase()) ||
      provider.businessName?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || provider.role === roleFilter
    const matchesVerification =
      verificationFilter === 'all' ||
      (verificationFilter === 'verified' && provider.verified) ||
      (verificationFilter === 'pending' && !provider.verified)
    return matchesSearch && matchesRole && matchesVerification
  })

  const stats = {
    total: providers.length,
    vets: providers.filter((p) => p.role === 'VET').length,
    groomers: providers.filter((p) => p.role === 'GROOMER').length,
    suppliers: providers.filter((p) => p.role === 'SUPPLIER').length,
    lovers: providers.filter((p) => p.role === 'LOVER').length,
    verified: providers.filter((p) => p.verified).length,
    pending: providers.filter((p) => !p.verified).length,
  }

  const getRoleBadge = (role: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'info' | 'danger'; icon: string }> = {
      VET: { variant: 'success', icon: '🩺' },
      GROOMER: { variant: 'warning', icon: '✂️' },
      SUPPLIER: { variant: 'info', icon: '🏪' },
      LOVER: { variant: 'danger', icon: '❤️' },
    }
    const cfg = config[role] || { variant: 'info' as const, icon: '👤' }
    return (
      <Badge variant={cfg.variant}>
        {cfg.icon} {role}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-orange-600 hover:text-orange-700 text-sm">
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Provider Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.vets}</p>
              <p className="text-sm text-gray-500">🩺 Vets</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.groomers}</p>
              <p className="text-sm text-gray-500">✂️ Groomers</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.suppliers}</p>
              <p className="text-sm text-gray-500">🏪 Suppliers</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-pink-600">{stats.lovers}</p>
              <p className="text-sm text-gray-500">❤️ Pet Lovers</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              <p className="text-sm text-gray-500">Verified</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Providers List */}
          <div className="lg:col-span-2">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>All Providers</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <Input
                    placeholder="Search providers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px]"
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="VET">Veterinarians</option>
                    <option value="GROOMER">Groomers</option>
                    <option value="SUPPLIER">Suppliers</option>
                    <option value="LOVER">Pet Lovers</option>
                  </select>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Providers */}
                <div className="space-y-3">
                  {filteredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedProvider?.id === provider.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                            {provider.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{provider.name}</p>
                            <p className="text-sm text-gray-500">{provider.businessName || provider.email}</p>
                          </div>
                        </div>
                        {getRoleBadge(provider.role)}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">⭐ {provider.rating}</span>
                          <span className="text-gray-500">📍 {provider.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {provider.verified && <Badge variant="success">Verified</Badge>}
                          {provider.aadhaarVerified && <Badge variant="info">KYC</Badge>}
                          {!provider.verified && <Badge variant="warning">Pending</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider Details */}
          <div>
            {selectedProvider ? (
              <Card variant="bordered" className="sticky top-4">
                <CardHeader>
                  <CardTitle>Provider Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-3xl mb-3">
                      {selectedProvider.name[0]}
                    </div>
                    <h3 className="font-semibold text-lg">{selectedProvider.name}</h3>
                    <p className="text-gray-500 text-sm">{selectedProvider.businessName}</p>
                    <div className="mt-2">{getRoleBadge(selectedProvider.role)}</div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Contact Info</h4>
                      <p className="text-sm text-gray-600">Email: {selectedProvider.email}</p>
                      <p className="text-sm text-gray-600">Phone: {selectedProvider.phone}</p>
                      <p className="text-sm text-gray-600">City: {selectedProvider.city}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Performance</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xl font-bold text-gray-900">⭐ {selectedProvider.rating}</p>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xl font-bold text-gray-900">{selectedProvider.totalBookings}</p>
                          <p className="text-xs text-gray-500">Bookings/Sales</p>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg mt-3">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(selectedProvider.totalRevenue)}
                        </p>
                        <p className="text-xs text-gray-500">Total Revenue</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Verification</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Profile</span>
                          {selectedProvider.verified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Button size="sm">Verify</Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">KYC</span>
                          {selectedProvider.aadhaarVerified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-400">
                        Joined: {new Date(selectedProvider.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Full Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Suspend Provider
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="bordered">
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Select a provider to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
