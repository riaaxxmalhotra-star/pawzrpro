'use client'

import { useState, useRef } from 'react'
import { Button } from './Button'
import { LoadingSpinner } from './Loading'

interface MultiImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  label?: string
  className?: string
}

export function MultiImageUpload({
  images,
  onImagesChange,
  maxImages = 6,
  label = 'Product Images',
  className = '',
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`)
      return
    }

    setIsUploading(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select only image files')
          continue
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setError('Each image must be less than 5MB')
          continue
        }

        // Upload file
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const { url } = await res.json()
          newImages.push(url)
        } else {
          setError('Failed to upload some images')
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages])
      }
    } catch (err) {
      setError('Failed to upload images. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images]
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
    onImagesChange(newImages)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} ({images.length}/{maxImages})
        </label>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 group"
          >
            <img
              src={image}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, 'left')}
                  className="p-1 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, 'right')}
                  className="p-1 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            {index === 0 && (
              <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
                Main
              </span>
            )}
          </div>
        ))}

        {/* Add Image Button */}
        {images.length < maxImages && (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-500 mt-1">Add Photo</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : `Upload Images (${maxImages - images.length} remaining)`}
        </Button>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <p className="text-xs text-gray-500 mt-2">
        Upload up to {maxImages} images. First image will be the main product photo.
        Max 5MB per image.
      </p>
    </div>
  )
}
