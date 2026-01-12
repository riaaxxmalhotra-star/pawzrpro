'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { LoadingPage } from '@/components/ui/Loading'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (status === 'loading') {
    return <LoadingPage message="Loading your dashboard..." />
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="absolute inset-0 bg-gray-50 flex overflow-hidden">
      <Sidebar
        role={session.user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto overflow-x-hidden -webkit-overflow-scrolling-touch" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
