'use client'

import { useState, useEffect } from 'react'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { indianStates, citiesByState, countries } from '@/lib/indianLocations'

interface AddressData {
  addressLine1: string
  addressLine2: string
  landmark: string
  city: string
  state: string
  country: string
  zipCode: string
  latitude?: number | null
  longitude?: number | null
  googleMapsLink?: string
}

interface AddressFormProps {
  address: AddressData
  onChange: (address: AddressData) => void
  showLocationPicker?: boolean
  className?: string
}

export function AddressForm({ address, onChange, showLocationPicker = true, className }: AddressFormProps) {
  const [cities, setCities] = useState<string[]>([])
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  // Update cities when state changes
  useEffect(() => {
    if (address.country === 'India' && address.state) {
      setCities(citiesByState[address.state] || [])
    } else {
      setCities([])
    }
  }, [address.state, address.country])

  const handleChange = (field: keyof AddressData, value: string | number | null) => {
    const newAddress = { ...address, [field]: value }

    // Reset city when state changes
    if (field === 'state') {
      newAddress.city = ''
    }

    // Reset state and city when country changes
    if (field === 'country') {
      newAddress.state = ''
      newAddress.city = ''
    }

    onChange(newAddress)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`

        onChange({
          ...address,
          latitude,
          longitude,
          googleMapsLink,
        })
        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out.')
            break
          default:
            setLocationError('An unknown error occurred.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const openInGoogleMaps = () => {
    if (address.googleMapsLink) {
      window.open(address.googleMapsLink, '_blank')
    } else if (address.latitude && address.longitude) {
      window.open(`https://www.google.com/maps?q=${address.latitude},${address.longitude}`, '_blank')
    }
  }

  const stateOptions = address.country === 'India'
    ? indianStates.map(s => ({ value: s, label: s }))
    : [{ value: '', label: 'Enter state manually' }]

  const cityOptions = cities.length > 0
    ? [{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c, label: c }))]
    : [{ value: '', label: 'Enter city manually' }]

  const countryOptions = countries.map(c => ({ value: c, label: c }))

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Address Line 1 */}
        <Input
          label="Address Line 1"
          value={address.addressLine1 || ''}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          placeholder="House/Flat No., Building Name"
        />

        {/* Address Line 2 */}
        <Input
          label="Address Line 2"
          value={address.addressLine2 || ''}
          onChange={(e) => handleChange('addressLine2', e.target.value)}
          placeholder="Street, Area, Colony"
        />

        {/* Landmark */}
        <Input
          label="Landmark"
          value={address.landmark || ''}
          onChange={(e) => handleChange('landmark', e.target.value)}
          placeholder="Near famous place, temple, etc."
        />

        {/* Country */}
        <Select
          label="Country"
          options={[{ value: '', label: 'Select Country' }, ...countryOptions]}
          value={address.country || ''}
          onChange={(e) => handleChange('country', e.target.value)}
        />

        {/* State */}
        {address.country === 'India' ? (
          <Select
            label="State"
            options={[{ value: '', label: 'Select State' }, ...stateOptions]}
            value={address.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
          />
        ) : (
          <Input
            label="State/Province"
            value={address.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="Enter state or province"
          />
        )}

        {/* City */}
        <div className="grid grid-cols-2 gap-4">
          {address.country === 'India' && cities.length > 0 ? (
            <Select
              label="City"
              options={cityOptions}
              value={address.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          ) : (
            <Input
              label="City"
              value={address.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter city"
            />
          )}

          {/* PIN/ZIP Code */}
          <Input
            label={address.country === 'India' ? 'PIN Code' : 'ZIP/Postal Code'}
            value={address.zipCode || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              handleChange('zipCode', value)
            }}
            placeholder={address.country === 'India' ? '6-digit PIN' : 'ZIP Code'}
            maxLength={address.country === 'India' ? 6 : 10}
          />
        </div>

        {/* Location Picker */}
        {showLocationPicker && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Location</h4>
                <p className="text-sm text-gray-500">Add your precise location for easier meetups</p>
              </div>
            </div>

            {address.latitude && address.longitude ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Location captured
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={openInGoogleMaps}>
                    View on Map
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation} isLoading={isLocating}>
                    Update Location
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  isLoading={isLocating}
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Current Location
                </Button>
                {locationError && (
                  <p className="mt-2 text-sm text-red-600">{locationError}</p>
                )}
              </div>
            )}

            {/* Manual Google Maps Link */}
            <div className="mt-3">
              <Input
                label="Or paste Google Maps Link"
                value={address.googleMapsLink || ''}
                onChange={(e) => handleChange('googleMapsLink', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
