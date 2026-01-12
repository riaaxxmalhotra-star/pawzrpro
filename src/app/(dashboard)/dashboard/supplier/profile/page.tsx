'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { LoadingSpinner } from '@/components/ui/Loading'

interface SupplierProfile {
  storeName: string
  description: string
  logo: string | null
  website: string
  user: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    zipCode: string
  }
}

export default function SupplierProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    logo: '',
    website: '',
    instagram: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profiles/supplier')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFormData({
          storeName: data.storeName || '',
          description: data.description || '',
          logo: data.logo || '',
          website: data.website || '',
          instagram: data.user?.instagram || '',
          phone: data.user?.phone || '',
          address: data.user?.address || '',
          city: data.user?.city || '',
          zipCode: data.user?.zipCode || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/profiles/supplier', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Store profile updated successfully!' })
        // Optionally redirect to products page
        setTimeout(() => {
          router.push('/dashboard/supplier/products')
        }, 1500)
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = (url: string) => {
    setFormData({ ...formData, logo: url })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Store Setup</h1>
        <p className="text-gray-600">Configure your store details to start selling</p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ImageUpload
            currentImage={formData.logo}
            onUpload={handleLogoUpload}
            label="Store Logo"
          />

          <Input
            label="Store Name"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            placeholder="My Pet Store"
            required
          />

          <Textarea
            label="Store Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell customers about your store and the products you sell..."
            rows={4}
          />

          <Input
            label="Website (optional)"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.mystore.com"
          />

          <Input
            label="Instagram Handle (optional)"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value.replace('@', '') })}
            placeholder="your_store_instagram"
          />

          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Contact & Address</h3>

            <div className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
              />

              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                />
                <Input
                  label="PIN Code"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="400001"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 pb-6 -mx-6 px-6 border-t mt-6 sm:relative sm:border-t-0 sm:mt-0 sm:pb-0 sm:pt-0">
            <Button type="submit" isLoading={isSaving} className="flex-1 sm:flex-none">
              Save & Continue
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
