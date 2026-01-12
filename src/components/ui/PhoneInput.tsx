'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Country codes with India on top
const countryCodes = [
  // India first
  { code: '+91', country: 'India', flag: 'IN' },
  // Other popular countries
  { code: '+1', country: 'United States', flag: 'US' },
  { code: '+44', country: 'United Kingdom', flag: 'GB' },
  { code: '+971', country: 'UAE', flag: 'AE' },
  { code: '+65', country: 'Singapore', flag: 'SG' },
  { code: '+61', country: 'Australia', flag: 'AU' },
  { code: '+49', country: 'Germany', flag: 'DE' },
  { code: '+33', country: 'France', flag: 'FR' },
  { code: '+81', country: 'Japan', flag: 'JP' },
  { code: '+86', country: 'China', flag: 'CN' },
  { code: '+82', country: 'South Korea', flag: 'KR' },
  { code: '+7', country: 'Russia', flag: 'RU' },
  { code: '+55', country: 'Brazil', flag: 'BR' },
  { code: '+52', country: 'Mexico', flag: 'MX' },
  { code: '+39', country: 'Italy', flag: 'IT' },
  { code: '+34', country: 'Spain', flag: 'ES' },
  { code: '+31', country: 'Netherlands', flag: 'NL' },
  { code: '+46', country: 'Sweden', flag: 'SE' },
  { code: '+47', country: 'Norway', flag: 'NO' },
  { code: '+45', country: 'Denmark', flag: 'DK' },
  { code: '+358', country: 'Finland', flag: 'FI' },
  { code: '+48', country: 'Poland', flag: 'PL' },
  { code: '+43', country: 'Austria', flag: 'AT' },
  { code: '+41', country: 'Switzerland', flag: 'CH' },
  { code: '+32', country: 'Belgium', flag: 'BE' },
  { code: '+351', country: 'Portugal', flag: 'PT' },
  { code: '+30', country: 'Greece', flag: 'GR' },
  { code: '+353', country: 'Ireland', flag: 'IE' },
  { code: '+64', country: 'New Zealand', flag: 'NZ' },
  { code: '+27', country: 'South Africa', flag: 'ZA' },
  { code: '+234', country: 'Nigeria', flag: 'NG' },
  { code: '+254', country: 'Kenya', flag: 'KE' },
  { code: '+20', country: 'Egypt', flag: 'EG' },
  { code: '+212', country: 'Morocco', flag: 'MA' },
  { code: '+966', country: 'Saudi Arabia', flag: 'SA' },
  { code: '+974', country: 'Qatar', flag: 'QA' },
  { code: '+973', country: 'Bahrain', flag: 'BH' },
  { code: '+968', country: 'Oman', flag: 'OM' },
  { code: '+965', country: 'Kuwait', flag: 'KW' },
  { code: '+92', country: 'Pakistan', flag: 'PK' },
  { code: '+880', country: 'Bangladesh', flag: 'BD' },
  { code: '+94', country: 'Sri Lanka', flag: 'LK' },
  { code: '+977', country: 'Nepal', flag: 'NP' },
  { code: '+95', country: 'Myanmar', flag: 'MM' },
  { code: '+66', country: 'Thailand', flag: 'TH' },
  { code: '+84', country: 'Vietnam', flag: 'VN' },
  { code: '+62', country: 'Indonesia', flag: 'ID' },
  { code: '+60', country: 'Malaysia', flag: 'MY' },
  { code: '+63', country: 'Philippines', flag: 'PH' },
  { code: '+852', country: 'Hong Kong', flag: 'HK' },
  { code: '+886', country: 'Taiwan', flag: 'TW' },
  { code: '+90', country: 'Turkey', flag: 'TR' },
  { code: '+972', country: 'Israel', flag: 'IL' },
  { code: '+98', country: 'Iran', flag: 'IR' },
  { code: '+964', country: 'Iraq', flag: 'IQ' },
  { code: '+962', country: 'Jordan', flag: 'JO' },
  { code: '+961', country: 'Lebanon', flag: 'LB' },
  { code: '+56', country: 'Chile', flag: 'CL' },
  { code: '+54', country: 'Argentina', flag: 'AR' },
  { code: '+57', country: 'Colombia', flag: 'CO' },
  { code: '+51', country: 'Peru', flag: 'PE' },
  { code: '+58', country: 'Venezuela', flag: 'VE' },
  { code: '+593', country: 'Ecuador', flag: 'EC' },
  { code: '+591', country: 'Bolivia', flag: 'BO' },
  { code: '+595', country: 'Paraguay', flag: 'PY' },
  { code: '+598', country: 'Uruguay', flag: 'UY' },
]

interface PhoneInputProps {
  label?: string
  countryCode: string
  phone: string
  onCountryCodeChange: (code: string) => void
  onPhoneChange: (phone: string) => void
  error?: string
  required?: boolean
  className?: string
}

export function PhoneInput({
  label,
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  error,
  required,
  className,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0]

  const filteredCountries = countryCodes.filter(
    c => c.country.toLowerCase().includes(search.toLowerCase()) ||
         c.code.includes(search)
  )

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '')
    onPhoneChange(value)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 border border-r-0 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[100px]',
              error ? 'border-red-300' : 'border-gray-300'
            )}
          >
            <span className="text-lg">{getFlagEmoji(selectedCountry.flag)}</span>
            <span className="text-sm font-medium">{selectedCountry.code}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onCountryCodeChange(country.code)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 hover:bg-orange-50 text-left',
                      country.code === countryCode && 'bg-orange-50'
                    )}
                  >
                    <span className="text-lg">{getFlagEmoji(country.flag)}</span>
                    <span className="flex-1 text-sm">{country.country}</span>
                    <span className="text-sm text-gray-500">{country.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="9876543210"
          className={cn(
            'flex-1 px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500',
            error ? 'border-red-300' : 'border-gray-300'
          )}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export { countryCodes }
