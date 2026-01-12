'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatCurrency } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  usersByRole: Record<string, number>
  totalBookings: number
  totalOrders: number
  platformRevenue: number
  totalSales: number
  pendingProfessionalVerifications: number
  pendingAadhaarVerifications: number
  newUsersLast7Days: number
  newUsersLast30Days: number
  dailyGrowth: Array<{ date: string; count: number }>
  verifiedUsers: number
  recentBookings: number
  bookingRevenue: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else if (response.status === 403) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: '📅', color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: 'bg-purple-50 text-purple-600' },
    { label: 'Platform Revenue', value: formatCurrency(stats?.platformRevenue || 0), icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
  ]

  const growthCards = [
    { label: 'New Users (7 days)', value: stats?.newUsersLast7Days || 0, icon: '📈' },
    { label: 'New Users (30 days)', value: stats?.newUsersLast30Days || 0, icon: '📊' },
    { label: 'Recent Bookings (7 days)', value: stats?.recentBookings || 0, icon: '🗓️' },
    { label: 'KYC Verified Users', value: stats?.verifiedUsers || 0, icon: '✅' },
  ]

  const quickLinks = [
    { label: 'Manage Users', href: '/admin/users', icon: '👥', description: 'View, verify, suspend users' },
    { label: 'Pending KYC', href: '/admin/users?filter=pending-aadhaar', icon: '🪪', description: `${stats?.pendingAadhaarVerifications || 0} pending` },
    { label: 'Pending Verifications', href: '/admin/users?filter=pending', icon: '⏳', description: `${stats?.pendingProfessionalVerifications || 0} pending` },
    { label: 'View Bookings', href: '/admin/bookings', icon: '📅', description: 'All bookings' },
    { label: 'View Orders', href: '/admin/orders', icon: '📦', description: 'All orders' },
    { label: 'Manage Events', href: '/admin/events', icon: '🎉', description: 'Create and manage' },
  ]

  const maxDailyCount = Math.max(...(stats?.dailyGrowth?.map(d => d.count) || [1]), 1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-xl font-bold text-orange-600">🐾 Pawzr</Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Welcome, {session?.user?.name}</span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Back to App</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Cards */}
        {((stats?.pendingAadhaarVerifications ?? 0) > 0 || (stats?.pendingProfessionalVerifications ?? 0) > 0) && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {(stats?.pendingAadhaarVerifications ?? 0) > 0 && (
              <Card variant="bordered" className="bg-yellow-50 border-yellow-200">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🪪</span>
                    <div>
                      <p className="font-medium text-yellow-900">Pending KYC Verifications</p>
                      <p className="text-sm text-yellow-700">
                        {stats?.pendingAadhaarVerifications} users waiting for Aadhaar verification
                      </p>
                    </div>
                  </div>
                  <Link href="/admin/users?filter=pending-aadhaar">
                    <Button size="sm">Review Now</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            {(stats?.pendingProfessionalVerifications ?? 0) > 0 && (
              <Card variant="bordered" className="bg-orange-50 border-orange-200">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="font-medium text-orange-900">Pending Professional Verifications</p>
                      <p className="text-sm text-orange-700">
                        {stats?.pendingProfessionalVerifications} professionals waiting
                      </p>
                    </div>
                  </div>
                  <Link href="/admin/users?filter=pending">
                    <Button size="sm">Review Now</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} variant="bordered">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Growth Stats */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Growth Numbers */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Growth Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {growthCards.map((card) => (
                  <div key={card.label} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">{card.icon}</div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Growth Chart */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>New Users (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-40 gap-2">
                {stats?.dailyGrowth?.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-orange-500 rounded-t transition-all"
                      style={{
                        height: `${Math.max((day.count / maxDailyCount) * 100, 4)}%`,
                        minHeight: '4px',
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-xs font-medium text-gray-700">{day.count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users by Role */}
        <Card variant="bordered" className="mb-8">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats?.usersByRole || {}).map(([role, count]) => {
                const roleConfig: Record<string, { icon: string; color: string }> = {
                  OWNER: { icon: '🐕', color: 'bg-orange-50 text-orange-600' },
                  LOVER: { icon: '❤️', color: 'bg-pink-50 text-pink-600' },
                  VET: { icon: '🩺', color: 'bg-green-50 text-green-600' },
                  GROOMER: { icon: '✂️', color: 'bg-purple-50 text-purple-600' },
                  SUPPLIER: { icon: '🏪', color: 'bg-blue-50 text-blue-600' },
                  ADMIN: { icon: '👑', color: 'bg-yellow-50 text-yellow-600' },
                }
                const config = roleConfig[role] || { icon: '👤', color: 'bg-gray-50 text-gray-600' }
                return (
                  <div key={role} className={`text-center p-4 rounded-lg ${config.color}`}>
                    <div className="text-2xl mb-1">{config.icon}</div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm">{role}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Summary */}
        <Card variant="bordered" className="mb-8">
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalSales || 0)}</p>
                <p className="text-sm text-green-700">Total Sales (Products)</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.bookingRevenue || 0)}</p>
                <p className="text-sm text-blue-700">Booking Revenue</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats?.platformRevenue || 0)}</p>
                <p className="text-sm text-yellow-700">Platform Fees (2%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1">
                    <span className="text-2xl">{link.icon}</span>
                    <span className="text-sm font-medium">{link.label}</span>
                    <span className="text-xs text-gray-500">{link.description}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
