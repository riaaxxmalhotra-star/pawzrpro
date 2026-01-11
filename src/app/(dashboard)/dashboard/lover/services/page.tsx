'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, serviceTypeDisplayNames } from '@/lib/utils'

interface Service {
  id: string
  type: string
  name: string
  description?: string
  price: number
  duration: number
  active: boolean
}

const serviceTypeOptions = [
  { value: 'WALKING', label: 'Dog Walking' },
  { value: 'SITTING', label: 'Pet Sitting' },
  { value: 'BOARDING', label: 'Pet Boarding' },
]

export default function LoverServicesPage() {
  const { addToast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    type: 'WALKING',
    name: '',
    description: '',
    price: '',
    duration: '60',
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        type: service.type,
        name: service.name,
        description: service.description || '',
        price: service.price.toString(),
        duration: service.duration.toString(),
      })
    } else {
      setEditingService(null)
      setFormData({
        type: 'WALKING',
        name: '',
        description: '',
        price: '',
        duration: '60',
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
        }),
      })

      if (response.ok) {
        addToast(editingService ? 'Service updated!' : 'Service added!', 'success')
        setIsModalOpen(false)
        fetchServices()
      } else {
        const data = await response.json()
        addToast(data.error || 'Failed to save service', 'error')
      }
    } catch (error) {
      addToast('An error occurred', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleServiceActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !service.active }),
      })

      if (response.ok) {
        addToast(service.active ? 'Service paused' : 'Service activated', 'success')
        fetchServices()
      }
    } catch (error) {
      addToast('Failed to update service', 'error')
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/services/${serviceId}`, { method: 'DELETE' })
      if (response.ok) {
        addToast('Service deleted', 'success')
        fetchServices()
      }
    } catch (error) {
      addToast('Failed to delete service', 'error')
    }
  }

  const getServiceIcon = (type: string) => {
    const icons: Record<string, string> = {
      WALKING: '🚶',
      SITTING: '🏠',
      BOARDING: '🛏️',
    }
    return icons[type] || '🐾'
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
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600">Manage the services you offer to pet owners</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Add Service</Button>
      </div>

      {services.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CardContent>
            <p className="text-5xl mb-4">🐕</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 mb-4">Add your first service to start receiving bookings!</p>
            <Button onClick={() => handleOpenModal()}>Add Your First Service</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id} variant="bordered" className={!service.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getServiceIcon(service.type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{serviceTypeDisplayNames[service.type]}</p>
                    </div>
                  </div>
                  <Badge variant={service.active ? 'success' : 'default'} size="sm">
                    {service.active ? 'Active' : 'Paused'}
                  </Badge>
                </div>

                {service.description && (
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="font-medium text-gray-900">{formatCurrency(service.price)}</span>
                  <span>•</span>
                  <span>{service.duration} min</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenModal(service)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleServiceActive(service)}
                  >
                    {service.active ? 'Pause' : 'Activate'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Service Type"
            options={serviceTypeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />

          <Input
            label="Service Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 30-Minute Dog Walk"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what's included in this service..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="25.00"
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="60"
              required
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingService ? 'Save Changes' : 'Add Service'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
