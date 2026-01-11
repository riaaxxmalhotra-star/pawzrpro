'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
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
  pendingVerifications: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/dashboard')
    }
    fetchStats()
  }, [status, session])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
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
    { label: 'Bookings', value: stats?.totalBookings || 0, icon: '📅', color: 'bg-green-50 text-green-600' },
    { label: 'Orders', value: stats?.totalOrders || 0, icon: '📦', color: 'bg-purple-50 text-purple-600' },
    { label: 'Platform Revenue', value: formatCurrency(stats?.platformRevenue || 0), icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
  ]

  const quickLinks = [
    { label: 'Manage Users', href: '/admin/users', icon: '👥' },
    { label: 'View Bookings', href: '/admin/bookings', icon: '📅' },
    { label: 'View Orders', href: '/admin/orders', icon: '📦' },
    { label: 'Manage Events', href: '/admin/events', icon: '🎉' },
    { label: 'Transactions', href: '/admin/transactions', icon: '💳' },
    { label: 'Reports', href: '/admin/reports', icon: '🚩' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-xl font-bold text-orange-600">Pawzr</Link>
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
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} variant="bordered">
              <CardContent className="flex items-center gap-4">
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

        {/* Users by Role */}
        <Card variant="bordered" className="mb-8">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats?.usersByRole || {}).map(([role, count]) => (
                <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500">{role}</p>
                </div>
              ))}
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
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <span className="text-2xl">{link.icon}</span>
                    <span className="text-sm">{link.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifications Alert */}
        {(stats?.pendingVerifications ?? 0) > 0 && (
          <Card variant="bordered" className="mt-8 bg-yellow-50 border-yellow-200">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-yellow-900">Pending Verifications</p>
                  <p className="text-sm text-yellow-700">
                    {stats?.pendingVerifications} professionals waiting for verification
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
    </div>
  )
}
