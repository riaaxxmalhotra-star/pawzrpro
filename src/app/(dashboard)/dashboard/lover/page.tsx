'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function LoverDashboard() {
  const { data: session } = useSession()

  const stats = [
    { label: 'Pending Requests', value: '0', icon: '📥', href: '/dashboard/lover/requests', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Upcoming Gigs', value: '0', icon: '📅', href: '/dashboard/lover/schedule', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Earnings', value: '$0', icon: '💰', href: '/dashboard/lover/earnings', color: 'bg-green-50 text-green-600' },
    { label: 'Reviews', value: '0', icon: '⭐', href: '/dashboard/lover/profile', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session?.user?.name?.split(' ')[0]}! 💝
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s your activity overview for today.
        </p>
      </div>

      {/* Profile completion alert */}
      <Card variant="bordered" className="bg-pink-50 border-pink-200">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👋</span>
            <div>
              <p className="font-medium text-pink-900">Complete your profile</p>
              <p className="text-sm text-pink-700">Add your bio, services, and rates to start receiving bookings</p>
            </div>
          </div>
          <Link href="/dashboard/lover/profile">
            <Button size="sm">Complete Profile</Button>
          </Link>
        </CardContent>
      </Card>

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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Incoming requests */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Booking Requests</CardTitle>
            <Link href="/dashboard/lover/requests" className="text-sm text-orange-600 hover:text-orange-700">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📥</p>
              <p>No pending requests</p>
              <p className="text-sm mt-1">New booking requests will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Today&apos;s schedule */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <Link href="/dashboard/lover/schedule" className="text-sm text-orange-600 hover:text-orange-700">
              View calendar
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📅</p>
              <p>No appointments today</p>
              <p className="text-sm mt-1">Your upcoming gigs will show here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services overview */}
      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Services</CardTitle>
          <Link href="/dashboard/lover/services" className="text-sm text-orange-600 hover:text-orange-700">
            Manage
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🐕</p>
            <p>No services listed yet</p>
            <p className="text-sm mt-1 mb-4">Add your services to start receiving booking requests</p>
            <Link href="/dashboard/lover/services">
              <Button variant="outline">Add Services</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming events */}
      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pet Meetups Near You</CardTitle>
          <Link href="/events" className="text-sm text-orange-600 hover:text-orange-700">
            Browse events
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🎉</p>
            <p>No upcoming events</p>
            <p className="text-sm mt-1">Check back later for pet meetups in your area!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
