import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 py-3 px-4" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <div className="container mx-auto">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            🐾 Pawzr
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 -webkit-overflow-scrolling-touch">
        <div className="flex items-start justify-center pb-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 py-3 px-4 text-center text-sm text-gray-500" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <p>&copy; {new Date().getFullYear()} Pawzr. All rights reserved.</p>
      </footer>
    </div>
  )
}
