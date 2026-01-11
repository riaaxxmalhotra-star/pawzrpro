import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <span className="text-2xl font-bold text-orange-600">Pawzr</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-orange-600 mb-4">
            Pawzr
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            The community where pets and pet lovers connect
          </p>
          <div className="max-w-2xl mx-auto text-gray-600 space-y-4">
            <p>
              Find trusted walkers, book grooming appointments, connect with vets,
              and discover the best supplies for your furry friends.
            </p>
            <p>
              Or offer your services, attend pet meetups, and join a community
              that loves animals as much as you do.
            </p>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Join Pawzr
            </Link>
            <Link
              href="/browse/lovers"
              className="bg-white text-orange-600 px-8 py-3 rounded-lg text-lg font-medium border-2 border-orange-600 hover:bg-orange-50 transition-colors"
            >
              Browse Services
            </Link>
          </div>
        </div>

        {/* Role Selection */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
            Join as...
          </h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Pet Owner */}
            <Link
              href="/signup"
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-orange-400"
            >
              <div className="text-4xl mb-3 text-center">🐕</div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                Pet Owner
              </h3>
              <p className="text-gray-600 text-center text-xs">
                Find services for your pet
              </p>
            </Link>

            {/* Pet Lover */}
            <Link
              href="/signup"
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-pink-400"
            >
              <div className="text-4xl mb-3 text-center">❤️</div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                Pet Lover
              </h3>
              <p className="text-gray-600 text-center text-xs">
                Offer walking & sitting
              </p>
            </Link>

            {/* Vet */}
            <Link
              href="/signup"
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-green-400"
            >
              <div className="text-4xl mb-3 text-center">🩺</div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                Veterinarian
              </h3>
              <p className="text-gray-600 text-center text-xs">
                Manage your clinic
              </p>
            </Link>

            {/* Groomer */}
            <Link
              href="/signup"
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-400"
            >
              <div className="text-4xl mb-3 text-center">✂️</div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                Groomer
              </h3>
              <p className="text-gray-600 text-center text-xs">
                Showcase your salon
              </p>
            </Link>

            {/* Supplier */}
            <Link
              href="/signup"
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-400"
            >
              <div className="text-4xl mb-3 text-center">🏪</div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                Supplier
              </h3>
              <p className="text-gray-600 text-center text-xs">
                Sell pet products
              </p>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
            What you can do on Pawzr
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Find Services</h3>
              <p className="text-gray-600 text-sm">
                Browse verified pet walkers, sitters, vets, and groomers in your area
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Book Appointments</h3>
              <p className="text-gray-600 text-sm">
                Schedule services with a few clicks and manage all your bookings
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">🛒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Shop Supplies</h3>
              <p className="text-gray-600 text-sm">
                Browse and purchase pet products from trusted suppliers
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">Chat & Connect</h3>
              <p className="text-gray-600 text-sm">
                Message service providers and coordinate care for your pets
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">📹</div>
              <h3 className="font-semibold text-gray-900 mb-2">Video Consultations</h3>
              <p className="text-gray-600 text-sm">
                Get 24/7 vet consultations via secure video calls
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pet Meetups</h3>
              <p className="text-gray-600 text-sm">
                Join local pet events and connect with other pet lovers
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to join the Pawzr community?
          </h2>
          <p className="text-gray-600 mb-6">
            Create your free account and start connecting with pet lovers today.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-500 mt-12 text-sm">
          Businesses pay just 2% on transactions. Pet owners and lovers use Pawzr for free.
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold text-white mb-2">Pawzr</p>
          <p className="text-sm">The pet community marketplace</p>
          <p className="text-xs mt-4">&copy; {new Date().getFullYear()} Pawzr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
