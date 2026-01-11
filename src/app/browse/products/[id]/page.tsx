'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  photos: string | null
  category: string
  inventory: number
  supplier: {
    id: string
    name: string
    supplierProfile: { storeName: string | null } | null
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (params.id) fetchProduct(params.id as string)
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/browse/products/${id}`)
      if (res.ok) setProduct(await res.json())
      else router.push('/browse/products')
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      photo: product.photos ? JSON.parse(product.photos)[0] : undefined,
      supplierId: product.supplier.id,
    })
  }

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <p className="text-gray-500">Product not found</p>
          <Link href="/browse/products"><Button className="mt-4">Back to Products</Button></Link>
        </Card>
      </div>
    )
  }

  const photos = product.photos ? JSON.parse(product.photos) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/browse/products" className="text-orange-600 hover:underline mb-4 inline-block">&larr; Back to Products</Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {photos.length > 0 ? (
              <img src={photos[0]} alt={product.name} className="w-full rounded-lg shadow-lg" />
            ) : (
              <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          <Card>
            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-500 mt-1">
              by {product.supplier.supplierProfile?.storeName || product.supplier.name}
            </p>
            <p className="text-3xl font-bold text-orange-600 mt-4">${product.price.toFixed(2)}</p>

            {product.description && (
              <div className="mt-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            <div className="mt-6">
              <p className={`text-sm ${product.inventory > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
              </p>
            </div>

            {product.inventory > 0 && (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >-</button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >+</button>
                </div>
                <Button onClick={handleAddToCart} className="flex-1">Add to Cart</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
