'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function OwnerDashboard() {
  const { data: session } = useSession()

  const stats = [
    { label: 'My Pets', value: '0', icon: '🐕', href: '/dashboard/owner/pets', color: 'bg-orange-50 text-orange-600' },
    { label: 'Upcoming Bookings', value: '0', icon: '📅', href: '/dashboard/owner/bookings', color: 'bg-blue-50 text-blue-600' },
    { label: 'Past Orders', value: '0', icon: '📦', href: '/dashboard/owner/orders', color: 'bg-green-50 text-green-600' },
    { label: 'Messages', value: '0', icon: '💬', href: '/messages', color: 'bg-purple-50 text-purple-600' },
  ]

  const quickActions = [
    { label: 'Add a Pet', href: '/dashboard/owner/pets', icon: '➕' },
    { label: 'Find a Walker', href: '/browse/lovers', icon: '🚶' },
    { label: 'Book a Vet', href: '/browse/vets', icon: '🩺' },
    { label: 'Shop Supplies', href: '/browse/products', icon: '🛒' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your pets today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer">
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
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <span className="text-2xl">{action.icon}</span>
                  <span>{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming bookings */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Bookings</CardTitle>
            <Link href="/dashboard/owner/bookings" className="text-sm text-orange-600 hover:text-orange-700">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📅</p>
              <p>No upcoming bookings</p>
              <Link href="/browse/lovers">
                <Button variant="ghost" size="sm" className="mt-2">
                  Book a service
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Pets</CardTitle>
            <Link href="/dashboard/owner/pets" className="text-sm text-orange-600 hover:text-orange-700">
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">🐾</p>
              <p>No pets added yet</p>
              <Link href="/dashboard/owner/pets">
                <Button variant="ghost" size="sm" className="mt-2">
                  Add your first pet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured events */}
      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Events Near You</CardTitle>
          <Link href="/events" className="text-sm text-orange-600 hover:text-orange-700">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🎉</p>
            <p>No upcoming events</p>
            <p className="text-sm mt-1">Check back later for pet meetups and events!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
