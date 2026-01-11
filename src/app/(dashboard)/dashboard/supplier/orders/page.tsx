'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'

interface Order {
  id: string
  status: string
  total: number
  platformFee: number
  shippingAddress: string
  shippingCity: string | null
  createdAt: string
  buyer: { name: string }
  items: Array<{ quantity: number; price: number; product: { name: string } }>
}

const statusColors: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) setOrders(await res.json())
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) fetchOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No orders yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mt-1">From: {order.buyer.name}</p>
                </div>
                <Badge variant={statusColors[order.status] || 'secondary'}>{order.status}</Badge>
              </div>

              <div className="mt-4 border-t pt-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-2 pt-2 border-t font-semibold">
                  <span>Total (after 2% fee)</span>
                  <span>${(order.total - order.platformFee).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>Ship to: {order.shippingAddress}{order.shippingCity && `, ${order.shippingCity}`}</p>
              </div>

              {order.status === 'PENDING' && (
                <div className="mt-4 flex gap-3">
                  <Button size="sm" onClick={() => updateStatus(order.id, 'CONFIRMED')}>Confirm</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'CANCELLED')}>Cancel</Button>
                </div>
              )}
              {order.status === 'CONFIRMED' && (
                <Button size="sm" className="mt-4" onClick={() => updateStatus(order.id, 'SHIPPED')}>Mark as Shipped</Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
