'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatDate, formatCurrency } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    photos?: string
  }
}

interface Order {
  id: string
  status: string
  subtotal: number
  platformFee: number
  total: number
  shippingAddress: string
  trackingNumber?: string
  createdAt: string
  items: OrderItem[]
  supplier: {
    id: string
    name: string
    supplierProfile?: {
      storeName?: string
    }
  }
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your product orders</p>
        </div>
        <Link href="/browse/products">
          <Button>Shop Products</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CardContent>
            <p className="text-5xl mb-4">📦</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">
              Browse our marketplace to find supplies for your pets!
            </p>
            <Link href="/browse/products">
              <Button>Shop Now</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} variant="bordered">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item) => {
                    const photos = item.product.photos ? JSON.parse(item.product.photos) : []
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {photos[0] ? (
                            <img src={photos[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium mt-2">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Tracking:</strong> {order.trackingNumber}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {order.status === 'DELIVERED' && (
                    <Button variant="outline" size="sm">
                      Leave Review
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
