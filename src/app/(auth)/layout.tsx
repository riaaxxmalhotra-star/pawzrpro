import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            Pawzr
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Pawzr. All rights reserved.</p>
      </footer>
    </div>
  )
}
