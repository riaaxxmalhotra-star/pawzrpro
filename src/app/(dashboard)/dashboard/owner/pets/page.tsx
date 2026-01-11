'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/ui/ImageUpload'

interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  age?: number
  weight?: number
  photo?: string
  medicalNotes?: string
  behaviorNotes?: string
  vaccinated: boolean
  neutered: boolean
}

const speciesOptions = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'hamster', label: 'Hamster' },
  { value: 'fish', label: 'Fish' },
  { value: 'other', label: 'Other' },
]

export default function PetsPage() {
  const { data: session } = useSession()
  const { addToast } = useToast()
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    weight: '',
    photo: '',
    medicalNotes: '',
    behaviorNotes: '',
    vaccinated: false,
    neutered: false,
  })

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/pets')
      if (response.ok) {
        const data = await response.json()
        setPets(data)
      }
    } catch (error) {
      console.error('Failed to fetch pets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet)
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
        weight: pet.weight?.toString() || '',
        photo: pet.photo || '',
        medicalNotes: pet.medicalNotes || '',
        behaviorNotes: pet.behaviorNotes || '',
        vaccinated: pet.vaccinated,
        neutered: pet.neutered,
      })
    } else {
      setEditingPet(null)
      setFormData({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        photo: '',
        medicalNotes: '',
        behaviorNotes: '',
        vaccinated: false,
        neutered: false,
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingPet ? `/api/pets/${editingPet.id}` : '/api/pets'
      const method = editingPet ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
        }),
      })

      if (response.ok) {
        addToast(editingPet ? 'Pet updated successfully!' : 'Pet added successfully!', 'success')
        setIsModalOpen(false)
        fetchPets()
      } else {
        const data = await response.json()
        addToast(data.error || 'Failed to save pet', 'error')
      }
    } catch (error) {
      addToast('An error occurred', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (petId: string) => {
    if (!confirm('Are you sure you want to remove this pet?')) return

    try {
      const response = await fetch(`/api/pets/${petId}`, { method: 'DELETE' })
      if (response.ok) {
        addToast('Pet removed successfully', 'success')
        fetchPets()
      }
    } catch (error) {
      addToast('Failed to remove pet', 'error')
    }
  }

  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      dog: '🐕',
      cat: '🐈',
      bird: '🐦',
      rabbit: '🐰',
      hamster: '🐹',
      fish: '🐟',
      other: '🐾',
    }
    return emojis[species] || '🐾'
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
          <h1 className="text-2xl font-bold text-gray-900">My Pets</h1>
          <p className="text-gray-600">Manage your furry family members</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          Add Pet
        </Button>
      </div>

      {pets.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CardContent>
            <p className="text-5xl mb-4">🐾</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets yet</h3>
            <p className="text-gray-600 mb-4">Add your first pet to get started!</p>
            <Button onClick={() => handleOpenModal()}>Add Your First Pet</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <Card key={pet.id} variant="bordered" className="overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                {pet.photo ? (
                  <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">{getSpeciesEmoji(pet.species)}</span>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {pet.breed || pet.species} {pet.age && `• ${pet.age} years old`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {pet.vaccinated && <Badge variant="success" size="sm">Vaccinated</Badge>}
                  {pet.neutered && <Badge variant="info" size="sm">Neutered</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenModal(pet)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(pet.id)}>
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

      {/* Add/Edit Pet Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPet ? 'Edit Pet' : 'Add New Pet'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            currentImage={formData.photo || null}
            onUpload={(url) => setFormData({ ...formData, photo: url })}
            label="Pet Photo"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Pet Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Buddy"
              required
            />
            <Select
              label="Species"
              options={speciesOptions}
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Breed"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              placeholder="Golden Retriever"
            />
            <Input
              label="Age (years)"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="3"
            />
            <Input
              label="Weight (lbs)"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="45"
            />
          </div>

          <Textarea
            label="Medical Notes"
            value={formData.medicalNotes}
            onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
            placeholder="Any allergies, conditions, or medications..."
          />

          <Textarea
            label="Behavior Notes"
            value={formData.behaviorNotes}
            onChange={(e) => setFormData({ ...formData, behaviorNotes: e.target.value })}
            placeholder="Friendly with other dogs, loves fetch..."
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.vaccinated}
                onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Vaccinated</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.neutered}
                onChange={(e) => setFormData({ ...formData, neutered: e.target.checked })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Neutered/Spayed</span>
            </label>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingPet ? 'Save Changes' : 'Add Pet'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
