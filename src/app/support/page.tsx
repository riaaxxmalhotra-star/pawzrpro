export const metadata = {
  title: 'Support - paw.zr',
  description: 'Get help and support for paw.zr app',
};

export default function Support() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Support</h1>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            We&apos;re here to help! If you have any questions, issues, or feedback about paw.zr,
            please reach out to us.
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong>{' '}
            <a href="mailto:support@pawzr.com" className="text-blue-600 hover:underline">
              support@pawzr.com
            </a>
          </p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">How do I book a pet service?</h3>
                <p className="text-gray-700">
                  Browse available services, select a provider, choose your pet and preferred time,
                  then confirm your booking. You&apos;ll receive a confirmation once the provider accepts.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">How do I become a service provider?</h3>
                <p className="text-gray-700">
                  Sign up and select your role (Pet Lover, Vet, or Groomer). Complete your profile,
                  verify your identity, and start accepting bookings from pet owners.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Is my payment information secure?</h3>
                <p className="text-gray-700">
                  Yes, we use industry-standard encryption and secure payment processors to protect
                  your financial information.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">How do I cancel a booking?</h3>
                <p className="text-gray-700">
                  Go to your bookings, select the booking you want to cancel, and tap &quot;Cancel Booking.&quot;
                  Please review our cancellation policy for any applicable fees.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">How do I delete my account?</h3>
                <p className="text-gray-700">
                  You can delete your account from the app settings or by contacting our support team.
                  Please note that this action is permanent.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Report an Issue</h2>
            <p className="text-gray-700">
              If you&apos;re experiencing technical issues or want to report inappropriate behavior,
              please email us with details at{' '}
              <a href="mailto:support@pawzr.com" className="text-blue-600 hover:underline">
                support@pawzr.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
