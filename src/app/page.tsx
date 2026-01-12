import Link from "next/link";

export default function Home() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100 flex flex-col overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto" style={{ paddingTop: 'max(40px, env(safe-area-inset-top))' }}>
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 drop-shadow-lg">🐾</div>
          <h1 className="text-5xl font-bold text-orange-600 tracking-tight">Pawzr</h1>
          <p className="text-gray-600 mt-3 text-lg">Your pet community</p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-sm">
          <span className="px-3 py-1.5 bg-white/70 rounded-full text-sm text-gray-700 shadow-sm">Pet Care</span>
          <span className="px-3 py-1.5 bg-white/70 rounded-full text-sm text-gray-700 shadow-sm">Grooming</span>
          <span className="px-3 py-1.5 bg-white/70 rounded-full text-sm text-gray-700 shadow-sm">Vet Services</span>
          <span className="px-3 py-1.5 bg-white/70 rounded-full text-sm text-gray-700 shadow-sm">Pet Shop</span>
        </div>

        {/* Role Icons */}
        <div className="flex justify-center gap-6 mb-10">
          <div className="text-center">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl mb-2">🐕</div>
            <span className="text-xs text-gray-600">Owner</span>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl mb-2">❤️</div>
            <span className="text-xs text-gray-600">Lover</span>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl mb-2">🩺</div>
            <span className="text-xs text-gray-600">Vet</span>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl mb-2">✂️</div>
            <span className="text-xs text-gray-600">Groomer</span>
          </div>
        </div>
      </main>

      {/* Bottom Auth Section */}
      <div className="px-6 pb-4" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <div className="space-y-3 max-w-sm mx-auto">
          <Link
            href="/signup"
            className="block w-full bg-orange-600 text-white py-4 rounded-2xl text-center font-semibold text-lg shadow-lg shadow-orange-600/30 active:scale-[0.98] transition-transform"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="block w-full bg-white text-orange-600 py-4 rounded-2xl text-center font-semibold text-lg shadow-md border border-orange-100 active:scale-[0.98] transition-transform"
          >
            Sign In
          </Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
