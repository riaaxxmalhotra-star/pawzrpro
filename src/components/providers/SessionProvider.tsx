'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'
import { initCapacitorApp } from '@/lib/capacitor'

export function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initCapacitorApp()
  }, [])

  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
