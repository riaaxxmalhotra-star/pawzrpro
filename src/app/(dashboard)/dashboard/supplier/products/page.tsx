'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/Loading'
import { MultiImageUpload } from '@/components/ui/MultiImageUpload'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  inventory: number
  photos: string | null
  active: boolean
}

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', inventory: '', photos: [] as string[] })

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) setProducts(await res.json())
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingProduct ? 'PUT' : 'POST'
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          inventory: parseInt(formData.inventory),
          photos: JSON.stringify(formData.photos),
        }),
      })
      if (res.ok) {
        fetchProducts()
        closeModal()
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const parsePhotos = (photos: string | null): string[] => {
    if (!photos) return []
    try {
      const parsed = JSON.parse(photos)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category,
        inventory: product.inventory.toString(),
        photos: parsePhotos(product.photos),
      })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', description: '', price: '', category: '', inventory: '0', photos: [] })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => openModal()}>Add Product</Button>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">No products yet</p>
          <Button onClick={() => openModal()}>Add Your First Product</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const productPhotos = parsePhotos(product.photos)
            return (
              <Card key={product.id} className="overflow-hidden">
                {productPhotos.length > 0 ? (
                  <div className="h-40 bg-gray-100">
                    <img
                      src={productPhotos[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge variant="default" size="sm">{product.category}</Badge>
                    </div>
                    <p className="text-lg font-bold text-orange-600">${product.price}</p>
                  </div>
                  {product.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>}
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{product.inventory} in stock</span>
                    <Button size="sm" variant="outline" onClick={() => openModal(product)}>Edit</Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultiImageUpload
            images={formData.photos}
            onImagesChange={(photos) => setFormData({ ...formData, photos })}
            maxImages={6}
            label="Product Images"
          />
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($)" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            <Input label="Inventory" type="number" value={formData.inventory} onChange={(e) => setFormData({ ...formData, inventory: e.target.value })} required />
          </div>
          <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Food, Toys, Accessories" required />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingProduct ? 'Update Product' : 'Create Product'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
