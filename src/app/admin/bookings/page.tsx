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
import { formatCurrency } from '@/lib/utils'

interface Booking {
  id: string
  customer: {
    name: string
    email: string
    avatar: string | null
  }
  provider: {
    name: string
    role: string
  }
  service: string
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  amount: number
  createdAt: string
}

// Mock data for demo
const mockBookings: Booking[] = [
  {
    id: '1',
    customer: { name: 'Rahul Kumar', email: 'rahul@example.com', avatar: null },
    provider: { name: 'Dr. Sarah Sharma', role: 'VET' },
    service: 'Annual Checkup',
    date: '2026-01-15',
    time: '10:00 AM',
    status: 'CONFIRMED',
    amount: 500,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: '2',
    customer: { name: 'Priya Sharma', email: 'priya@example.com', avatar: null },
    provider: { name: 'PetSpa Studio', role: 'GROOMER' },
    service: 'Full Grooming',
    date: '2026-01-16',
    time: '2:30 PM',
    status: 'PENDING',
    amount: 800,
    createdAt: '2026-01-11T14:00:00Z',
  },
  {
    id: '3',
    customer: { name: 'Amit Patel', email: 'amit@example.com', avatar: null },
    provider: { name: 'Happy Paws Walker', role: 'LOVER' },
    service: 'Dog Walking',
    date: '2026-01-14',
    time: '8:00 AM',
    status: 'COMPLETED',
    amount: 300,
    createdAt: '2026-01-12T08:00:00Z',
  },
  {
    id: '4',
    customer: { name: 'Neha Gupta', email: 'neha@example.com', avatar: null },
    provider: { name: 'Dr. Amit Kumar', role: 'VET' },
    service: 'Vaccination',
    date: '2026-01-13',
    time: '11:00 AM',
    status: 'CANCELLED',
    amount: 600,
    createdAt: '2026-01-09T11:00:00Z',
  },
]

export default function AdminBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-login')
    }
  }, [status, router])

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.provider.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.service.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesProvider = providerFilter === 'all' || booking.provider.role === providerFilter
    return matchesSearch && matchesStatus && matchesProvider
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    revenue: bookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.amount, 0),
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'danger' | 'info'> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getProviderIcon = (role: string) => {
    const icons: Record<string, string> = {
      VET: '🩺',
      GROOMER: '✂️',
      LOVER: '❤️',
    }
    return icons[role] || '👤'
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
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Booking Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              <p className="text-sm text-gray-500">Confirmed</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-gray-500">Cancelled</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
              <p className="text-sm text-gray-500">Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="bordered" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Providers</option>
                <option value="VET">Veterinarians</option>
                <option value="GROOMER">Groomers</option>
                <option value="LOVER">Pet Lovers</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Provider</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">#{booking.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                            {booking.customer.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.customer.name}</p>
                            <p className="text-xs text-gray-500">{booking.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{getProviderIcon(booking.provider.role)}</span>
                          <span className="text-sm text-gray-900">{booking.provider.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{booking.service}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">{booking.date}</p>
                        <p className="text-xs text-gray-500">{booking.time}</p>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {formatCurrency(booking.amount)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
