'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function VetDashboard() {
  const { data: session } = useSession()

  const stats = [
    { label: 'Today\'s Appointments', value: '0', icon: '📅', href: '/dashboard/vet/appointments', color: 'bg-green-50 text-green-600' },
    { label: 'Pending Requests', value: '0', icon: '📥', href: '/dashboard/vet/appointments', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Total Patients', value: '0', icon: '🐾', href: '/dashboard/vet/patients', color: 'bg-blue-50 text-blue-600' },
    { label: 'This Month', value: '$0', icon: '💰', href: '/dashboard/vet/earnings', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, Dr. {session?.user?.name?.split(' ').pop()}! 🩺
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s your clinic overview for today.
        </p>
      </div>

      {/* Verification alert */}
      <Card variant="bordered" className="bg-green-50 border-green-200">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-green-900">Complete your clinic profile</p>
              <p className="text-sm text-green-700">Add your clinic details and upload your license for verification</p>
            </div>
          </div>
          <Link href="/dashboard/vet/profile">
            <Button size="sm">Setup Clinic</Button>
          </Link>
        </CardContent>
      </Card>

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
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Appointment Requests</CardTitle>
            <Link href="/dashboard/vet/appointments" className="text-sm text-orange-600 hover:text-orange-700">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📋</p>
              <p>No pending requests</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <Link href="/dashboard/vet/appointments" className="text-sm text-orange-600 hover:text-orange-700">
              View calendar
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📅</p>
              <p>No appointments scheduled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Patients</CardTitle>
          <Link href="/dashboard/vet/patients" className="text-sm text-orange-600 hover:text-orange-700">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🐾</p>
            <p>No patient records yet</p>
            <p className="text-sm mt-1">Patient records will appear here after appointments</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
