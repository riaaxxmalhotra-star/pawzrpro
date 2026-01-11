'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  photos?: string
  category: string
  inventory: number
  supplier: {
    id: string
    name: string
    supplierProfile?: {
      storeName?: string
    }
  }
}

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'food', label: 'Food & Treats' },
  { value: 'toys', label: 'Toys' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'bedding', label: 'Beds & Furniture' },
  { value: 'other', label: 'Other' },
]

export default function BrowseProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [category])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)

      const response = await fetch(`/api/browse/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getProductImage = (product: Product) => {
    if (product.photos) {
      try {
        const photos = JSON.parse(product.photos)
        return photos[0]
      } catch {
        return null
      }
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Pet Supplies Shop</h1>
          <p className="text-blue-100">Find the best products for your furry friends</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-64"
          />
          <Select
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="sm:w-48"
          />
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <CardContent>
              <p className="text-5xl mb-4">🛒</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchQuery || category
                  ? 'Try adjusting your search filters'
                  : 'No products available yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/browse/products/${product.id}`}>
                <Card variant="bordered" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
                    {getProductImage(product) ? (
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        📦
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">
                      {product.supplier.supplierProfile?.storeName || product.supplier.name}
                    </p>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">{formatCurrency(product.price)}</p>
                      {product.inventory < 10 && product.inventory > 0 && (
                        <span className="text-xs text-orange-600">Only {product.inventory} left</span>
                      )}
                      {product.inventory === 0 && (
                        <span className="text-xs text-red-600">Out of stock</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
