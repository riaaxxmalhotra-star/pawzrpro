'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/Loading'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const role = session.user.role?.toLowerCase()
    switch (role) {
      case 'owner':
        router.push('/dashboard/owner')
        break
      case 'lover':
        router.push('/dashboard/lover')
        break
      case 'vet':
        router.push('/dashboard/vet')
        break
      case 'groomer':
        router.push('/dashboard/groomer')
        break
      case 'supplier':
        router.push('/dashboard/supplier')
        break
      case 'admin':
        router.push('/admin')
        break
      default:
        router.push('/dashboard/owner')
    }
  }, [session, status, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  )
}
