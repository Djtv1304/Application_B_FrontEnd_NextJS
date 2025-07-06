import Image from "next/image";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <Image
            src="https://dudsclothes.com/wp-content/uploads/2023/07/DUDS-logo-retina.png"
            alt="DUDS Logo"
            width={120}
            height={35}
            className="mx-auto mb-6"
            priority
          />
          
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Forbidden
            </h1>
            <p className="text-gray-600 mb-2">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator if you believe this is an error.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors block text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/sign-out"
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors block text-center"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}