'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

const roles = [
  {
    id: 'OWNER',
    title: 'Pet Owner',
    description: 'Find walkers, groomers, vets, and supplies',
    icon: '🐕',
    color: 'border-orange-400 bg-orange-50',
  },
  {
    id: 'LOVER',
    title: 'Pet Lover',
    description: 'Offer walking, sitting, and pet care services',
    icon: '❤️',
    color: 'border-pink-400 bg-pink-50',
  },
  {
    id: 'VET',
    title: 'Veterinarian',
    description: 'Manage your clinic and patient appointments',
    icon: '🩺',
    color: 'border-green-400 bg-green-50',
  },
  {
    id: 'GROOMER',
    title: 'Groomer',
    description: 'Showcase your salon and manage bookings',
    icon: '✂️',
    color: 'border-purple-400 bg-purple-50',
  },
  {
    id: 'SUPPLIER',
    title: 'Supplier',
    description: 'Sell pet products to thousands of pet owners',
    icon: '🏪',
    color: 'border-blue-400 bg-blue-50',
  },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [selectedRole, setSelectedRole] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    setStep('details')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: selectedRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      // Sign in the user
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'role') {
    return (
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join Pawzr</h1>
          <p className="text-gray-600 mt-2">Select your role to get started</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg hover:-translate-y-1 ${role.color}`}
            >
              <div className="text-4xl mb-3">{role.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{role.description}</p>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  const selectedRoleData = roles.find((r) => r.id === selectedRole)

  return (
    <Card variant="elevated" className="w-full max-w-md">
      <button
        onClick={() => setStep('role')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Change role
      </button>

      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{selectedRoleData?.icon}</div>
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-gray-600 mt-1">as a {selectedRoleData?.title}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-orange-600 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-orange-600 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </Card>
  )
}
