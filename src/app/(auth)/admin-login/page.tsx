'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Show more specific error messages
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password')
        } else {
          setError(result.error)
        }
        setIsLoading(false)
        return
      }

      // Verify admin role
      const userRes = await fetch('/api/users/me')
      const userData = await userRes.json()

      if (userData.role !== 'ADMIN') {
        setError('Access denied. Admin credentials required.')
        setIsLoading(false)
        return
      }

      router.push('/admin')
    } catch {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Card variant="elevated" className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🔐</div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
        <p className="text-gray-600 mt-1">Access the Pawzr admin dashboard</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@pawzr.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
          Back to regular login
        </Link>
      </p>
    </Card>
  )
}
