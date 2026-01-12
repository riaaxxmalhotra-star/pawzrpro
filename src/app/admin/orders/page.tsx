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

interface Order {
  id: string
  customer: {
    name: string
    email: string
    phone: string
  }
  supplier: {
    name: string
    businessName: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  address: string
  createdAt: string
}

// Mock data for demo
const mockOrders: Order[] = [
  {
    id: 'ORD-2847',
    customer: { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '+91 98765 43210' },
    supplier: { name: 'Pet Paradise Store', businessName: 'Pet Paradise' },
    items: [
      { name: 'Premium Dog Food 5kg', quantity: 2, price: 1200 },
      { name: 'Chew Toys Set', quantity: 1, price: 450 },
    ],
    total: 2850,
    status: 'PENDING',
    address: 'Koramangala, Bangalore',
    createdAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'ORD-2846',
    customer: { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 87654 32109' },
    supplier: { name: 'Happy Paws Shop', businessName: 'Happy Paws' },
    items: [{ name: 'Cat Litter 10kg', quantity: 1, price: 800 }],
    total: 800,
    status: 'CONFIRMED',
    address: 'Indiranagar, Bangalore',
    createdAt: '2026-01-13T08:00:00Z',
  },
  {
    id: 'ORD-2845',
    customer: { name: 'Amit Patel', email: 'amit@example.com', phone: '+91 76543 21098' },
    supplier: { name: 'Pet Paradise Store', businessName: 'Pet Paradise' },
    items: [
      { name: 'Pet Grooming Kit', quantity: 1, price: 1500 },
      { name: 'Pet Shampoo', quantity: 2, price: 350 },
    ],
    total: 2200,
    status: 'SHIPPED',
    address: 'HSR Layout, Bangalore',
    createdAt: '2026-01-12T14:00:00Z',
  },
  {
    id: 'ORD-2844',
    customer: { name: 'Neha Gupta', email: 'neha@example.com', phone: '+91 65432 10987' },
    supplier: { name: 'Happy Paws Shop', businessName: 'Happy Paws' },
    items: [{ name: 'Dog Bed Large', quantity: 1, price: 2500 }],
    total: 2500,
    status: 'DELIVERED',
    address: 'Whitefield, Bangalore',
    createdAt: '2026-01-11T11:00:00Z',
  },
]

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-login')
    }
  }, [status, router])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    confirmed: orders.filter((o) => o.status === 'CONFIRMED').length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    platformFee: orders.reduce((sum, o) => sum + o.total * 0.02, 0),
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'danger' | 'info'> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      SHIPPED: 'default',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
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
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Order Management</h1>
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
              <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              <p className="text-sm text-gray-500">Shipped</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-sm text-gray-500">Delivered</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-500">Total Sales</p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.platformFee)}</p>
              <p className="text-sm text-gray-500">Platform Fee</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <Input
                    placeholder="Search orders..."
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
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Orders */}
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedOrder?.id === order.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium text-gray-700">
                            {order.id}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{order.customer.name}</span>
                        <span>{order.supplier.businessName}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div>
            {selectedOrder ? (
              <Card variant="bordered" className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium">{selectedOrder.id}</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Customer</h4>
                      <p className="text-sm text-gray-900">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer.email}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer.phone}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Supplier</h4>
                      <p className="text-sm text-gray-900">{selectedOrder.supplier.businessName}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.supplier.name}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Delivery Address</h4>
                      <p className="text-sm text-gray-600">{selectedOrder.address}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-medium mt-3 pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 mt-1">
                        <span>Platform Fee (2%)</span>
                        <span>{formatCurrency(selectedOrder.total * 0.02)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-400">
                        Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="bordered">
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Select an order to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
