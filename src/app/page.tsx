import Image from "next/image";
import Link from "next/link";
import {getSignInUrl, getSignUpUrl, signOut, withAuth} from "@workos-inc/authkit-nextjs";
import CatalogDashboard from './dashboard';

export default async function Home() {
  const { user } = await withAuth();
  const signUpUrl = await getSignUpUrl();
  const signInUrl = await getSignInUrl();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              DUDS - Catalog Generator
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access the catalog generator
            </p>
            <div className="space-y-3">
              <Link
                href={signInUrl}
                className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors block text-center"
              >
                Sign In
              </Link>
              <Link
                href={signUpUrl}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors block text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <CatalogDashboard user={user} />;
}
