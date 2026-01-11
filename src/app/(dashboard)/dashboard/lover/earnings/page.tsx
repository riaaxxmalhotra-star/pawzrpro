'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'

interface Stats {
  totalEarnings: number
  completedBookings: number
  pendingPayouts: number
  thisMonth: number
}

export default function EarningsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/earnings')
      if (res.ok) setStats(await res.json())
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-2xl font-bold text-green-600">${stats?.totalEarnings?.toFixed(2) || '0.00'}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold">${stats?.thisMonth?.toFixed(2) || '0.00'}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Completed Bookings</p>
          <p className="text-2xl font-bold">{stats?.completedBookings || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pending Payouts</p>
          <p className="text-2xl font-bold text-orange-600">${stats?.pendingPayouts?.toFixed(2) || '0.00'}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Payout History</h2>
        <p className="text-gray-500 text-center py-8">No payout history yet</p>
      </Card>
    </div>
  )
}
