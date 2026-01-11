'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { cart, clearCart } = useCart()
  const { items, subtotal, platformFee, total } = cart
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingZip: '',
  })

  if (!session) {
    router.push('/login?callbackUrl=/checkout')
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-4">Add some products to your cart first</p>
          <Link href="/browse/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          ...formData,
        }),
      })

      if (res.ok) {
        clearCart()
        router.push('/dashboard/owner/orders?success=true')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card>
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Street Address"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={formData.shippingCity}
                    onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                    required
                  />
                  <Input
                    label="ZIP Code"
                    value={formData.shippingZip}
                    onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Place Order - ${total.toFixed(2)}
                </Button>
              </form>
            </Card>
          </div>

          <div>
            <Card>
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Platform Fee (2%)</span>
                    <span>${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
