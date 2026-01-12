'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface LiveLocationProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  onLocationUpdate?: (lat: number, lng: number) => void
  otherUserLocation?: { latitude: number; longitude: number; name: string; updatedAt: Date } | null
  updateInterval?: number // in milliseconds
}

export function LiveLocation({
  isEnabled,
  onToggle,
  onLocationUpdate,
  otherUserLocation,
  updateInterval = 30000, // 30 seconds default
}: LiveLocationProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    setIsUpdating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        setLastUpdate(new Date())
        setError('')
        setIsUpdating(false)

        if (onLocationUpdate) {
          onLocationUpdate(latitude, longitude)
        }
      },
      (err) => {
        setError(err.message)
        setIsUpdating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [onLocationUpdate])

  // Auto-update location when enabled
  useEffect(() => {
    if (!isEnabled) return

    updateLocation() // Initial update
    const interval = setInterval(updateLocation, updateInterval)
    return () => clearInterval(interval)
  }, [isEnabled, updateInterval, updateLocation])

  const handleToggle = () => {
    if (!isEnabled) {
      // Request permission first
      navigator.geolocation.getCurrentPosition(
        () => {
          onToggle(true)
        },
        (err) => {
          setError(err.message === 'User denied Geolocation'
            ? 'Please enable location access in your browser settings'
            : err.message)
        }
      )
    } else {
      onToggle(false)
      setCurrentLocation(null)
    }
  }

  const openDirections = () => {
    if (otherUserLocation) {
      const url = currentLocation
        ? `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${otherUserLocation.latitude},${otherUserLocation.longitude}`
        : `https://www.google.com/maps?q=${otherUserLocation.latitude},${otherUserLocation.longitude}`
      window.open(url, '_blank')
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 120) return '1 minute ago'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    return `${Math.floor(seconds / 3600)} hours ago`
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
            <svg
              className={`w-5 h-5 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Live Location Sharing</h3>
            <p className="text-sm text-gray-500">
              {isEnabled ? 'Sharing your location' : 'Share your location for meetups'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {isEnabled && (
        <div className="space-y-4">
          {/* Your Location Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isUpdating ? (
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              ) : (
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              )}
              <span className="text-sm text-gray-600">
                {isUpdating ? 'Updating...' : 'Location active'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Updated {formatTimeAgo(lastUpdate)}
              </span>
            )}
          </div>

          {/* Other User Location */}
          {otherUserLocation && (
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {otherUserLocation.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{otherUserLocation.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(new Date(otherUserLocation.updatedAt))}
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={openDirections}>
                  Get Directions
                </Button>
              </div>

              {/* Mini Map Preview */}
              <a
                href={`https://www.google.com/maps?q=${otherUserLocation.latitude},${otherUserLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${otherUserLocation.latitude},${otherUserLocation.longitude}&zoom=15&size=400x150&markers=color:red%7C${otherUserLocation.latitude},${otherUserLocation.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}`}
                  alt="Location map"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback if no API key
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="mt-2 text-center text-sm text-orange-600 hover:text-orange-700">
                  Open in Google Maps
                </div>
              </a>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Location updates every {updateInterval / 1000} seconds</p>
            <p>• Only visible to confirmed booking participants</p>
            <p>• Turn off when meetup is complete</p>
          </div>
        </div>
      )}
    </Card>
  )
}
