'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  photos: string | null
  category: string
  inventory: number
}

interface Supplier {
  id: string
  storeName: string
  description: string
  logo: string | null
  website: string | null
  user: {
    id: string
    name: string
    avatar: string | null
    verified: boolean
  }
  products: Product[]
}

export default function SupplierDetailPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const { addToast } = useToast()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSupplier()
    }
  }, [params.id])

  const fetchSupplier = async () => {
    try {
      const res = await fetch(`/api/suppliers/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setSupplier(data)
      }
    } catch (error) {
      console.error('Failed to fetch supplier:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      photo: product.photos ? JSON.parse(product.photos)[0] : undefined,
      supplierId: params.id as string,
    })
    addToast(`${product.name} added to cart`, 'success')
  }

  const getProductImage = (photos: string | null): string | null => {
    if (!photos) return null
    try {
      const parsed = JSON.parse(photos)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
    } catch {
      return photos
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <CardContent>
            <h1 className="text-xl font-bold mb-2">Supplier Not Found</h1>
            <p className="text-gray-500 mb-4">This supplier may no longer exist.</p>
            <Link href="/browse/suppliers">
              <Button>Browse Suppliers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Supplier Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar
                src={supplier.logo || supplier.user.avatar}
                name={supplier.storeName || supplier.user.name || 'Supplier'}
                size="xl"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {supplier.storeName || supplier.user.name}
                  </h1>
                  {supplier.user.verified && (
                    <Badge variant="success">Verified Supplier</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  {supplier.description || 'Quality pet products for your furry friends'}
                </p>
                {supplier.website && (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Products</h2>

        {supplier.products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-5xl mb-4">📦</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600">This supplier hasn't added any products yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {supplier.products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {getProductImage(product.photos) ? (
                    <img
                      src={getProductImage(product.photos)!}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>
                <CardContent className="p-4">
                  <Link href={`/browse/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-orange-600 mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.inventory === 0}
                    >
                      {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
