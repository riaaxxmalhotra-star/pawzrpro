'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'

interface EarningsData {
  totalRevenue: number
  platformFees: number
  netEarnings: number
  pendingPayouts: number
  completedOrders: number
}

export default function SupplierEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData>({
    totalRevenue: 0,
    platformFees: 0,
    netEarnings: 0,
    pendingPayouts: 0,
    completedOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      // Fetch orders for supplier
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        const orders = data.orders || []

        // Calculate earnings from completed orders
        const completedOrders = orders.filter((o: { status: string }) => o.status === 'DELIVERED')
        const pendingOrders = orders.filter((o: { status: string }) =>
          o.status === 'PROCESSING' || o.status === 'SHIPPED'
        )

        const totalRevenue = completedOrders.reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0)
        const platformFees = totalRevenue * 0.02 // 2% platform fee
        const netEarnings = totalRevenue - platformFees
        const pendingPayouts = pendingOrders.reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0)

        setEarnings({
          totalRevenue,
          platformFees,
          netEarnings,
          pendingPayouts,
          completedOrders: completedOrders.length,
        })
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600">Track your revenue and payouts</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs {earnings.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform Fees (2%)</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs {earnings.platformFees.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Earnings</p>
                <p className="text-xl font-bold text-green-600">
                  Rs {earnings.netEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Orders</p>
                <p className="text-xl font-bold text-gray-900">
                  {earnings.completedOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How payouts work</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Payouts are processed weekly for completed orders</li>
              <li>• A 2% platform fee is deducted from each sale</li>
              <li>• Funds are transferred to your linked bank account</li>
              <li>• Minimum payout threshold: Rs 500</li>
            </ul>
          </div>

          {earnings.pendingPayouts > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-900">
                Pending Payout: Rs {earnings.pendingPayouts.toFixed(2)}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Will be processed in the next payout cycle
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📋</p>
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Your sales transactions will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
