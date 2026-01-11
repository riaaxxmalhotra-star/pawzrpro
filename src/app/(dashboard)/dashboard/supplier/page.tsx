'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SupplierDashboard() {
  const { data: session } = useSession()

  const stats = [
    { label: 'Products', value: '0', icon: '📦', href: '/dashboard/supplier/products', color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Orders', value: '0', icon: '🛒', href: '/dashboard/supplier/orders', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Shipped', value: '0', icon: '🚚', href: '/dashboard/supplier/orders', color: 'bg-purple-50 text-purple-600' },
    { label: 'Revenue', value: '$0', icon: '💰', href: '/dashboard/supplier/earnings', color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session?.user?.name?.split(' ')[0]}! 🏪
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s your store overview for today.
        </p>
      </div>

      <Card variant="bordered" className="bg-blue-50 border-blue-200">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-medium text-blue-900">Setup your store</p>
              <p className="text-sm text-blue-700">Add your store details and start listing products</p>
            </div>
          </div>
          <Link href="/dashboard/supplier/profile">
            <Button size="sm">Setup Store</Button>
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
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/dashboard/supplier/orders" className="text-sm text-orange-600 hover:text-orange-700">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">🛒</p>
              <p>No orders yet</p>
              <p className="text-sm mt-1">Orders will appear here when customers purchase</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Low Stock Alerts</CardTitle>
            <Link href="/dashboard/supplier/products" className="text-sm text-orange-600 hover:text-orange-700">
              Manage inventory
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📦</p>
              <p>No low stock items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Products</CardTitle>
          <Link href="/dashboard/supplier/products" className="text-sm text-orange-600 hover:text-orange-700">
            Manage
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📦</p>
            <p>No products listed yet</p>
            <p className="text-sm mt-1 mb-4">Add products to start selling to pet owners</p>
            <Link href="/dashboard/supplier/products">
              <Button variant="outline">Add Products</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Platform fee info */}
      <Card variant="bordered" className="bg-gray-50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-600">
            <strong>Platform Fee:</strong> Pawzr takes just 2% of each sale. You keep 98%!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
