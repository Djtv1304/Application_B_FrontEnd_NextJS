'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { apiService } from '../services/api';
// import { signOut } from "@workos-inc/authkit-nextjs";
import { signOutAction } from './sign-out/route';

interface User {
  firstName: string;
  [key: string]: any;
}

interface CatalogDashboardProps {
  user: User;
}

export default function CatalogDashboard({ user }: CatalogDashboardProps) {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [backendInfo, setBackendInfo] = useState<any>(null);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setConnectionStatus('checking');
      setError(null);
      
      console.log('🔍 Checking backend connection...');
      const healthData = await apiService.healthCheck();
      console.log('✅ Health check successful:', healthData);
      
      console.log('🔍 Getting categories...');
      const categoriesData = await apiService.getCategories();
      console.log('✅ Categories obtained:', categoriesData);
      
      setBackendInfo(healthData);
      setCategoriesCount(categoriesData.categories?.length || 0);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('❌ Error connecting to backend:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setConnectionStatus('error');
    }
  };

  const handleStartCatalog = () => {
    if (connectionStatus === 'connected') {
      console.log('🚀 Navigating to categories...');
      router.push('/categories');
    } else {
      alert('⚠️ Please verify that the backend is running before continuing.');
    }
  };

  const handleSignOut = () => {
    // Redirect to a server action for sign out
    window.location.href = '/sign-out';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Image
              src="https://dudsclothes.com/wp-content/uploads/2023/07/DUDS-logo-retina.png"
              alt="DUDS Logo"
              width={120}
              height={35}
              className="object-contain"
              priority
            />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName}
              </span>
              <button
                onClick={() => router.push('/admin')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Admin
              </button>
              

               <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            DUDS - Catalog Generator
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create personalized catalogs of our products quickly and easily
          </p>

          {/* Connection status */}
          <div className="mb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border">
              {connectionStatus === 'checking' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                  <span className="text-gray-700">Checking Connection...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-700">Connected to Backend</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-red-700">Connection Error</span>
                </>
              )}
            </div>
            
            {connectionStatus === 'connected' && (
              <p className="text-sm text-gray-500 mt-2">
                Backend available at: http://localhost:8000 • {categoriesCount} categories found
              </p>
            )}
          </div>

          {/* Start button */}
          <button
            onClick={handleStartCatalog}
            disabled={connectionStatus !== 'connected'}
            className={`px-8 py-3 text-lg font-medium rounded-md transition-all duration-200 ${
              connectionStatus === 'connected'
                ? 'bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {connectionStatus === 'connected' ? '🚀 Start Catalog!' : 'Waiting for Connection...'}
          </button>

          {/* Retry button */}
          {connectionStatus === 'error' && (
            <button
              onClick={checkBackendConnection}
              className="ml-4 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              🔄 Retry Connection
            </button>
          )}
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <p className="mt-1 text-sm text-red-700">
                  Verify that the backend is running at http://localhost:8000
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {connectionStatus === 'connected' ? '🎉 System Operational!' : '🔧 System Configuration'}
          </h2>
          
          {connectionStatus === 'connected' ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Frontend and Backend connected successfully.
              </p>
              
              {backendInfo && (
                <div className="flex justify-center gap-4 flex-wrap">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Categories: {categoriesCount}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    API REST: Active
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Database: Connected
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-center">
              Frontend configured correctly.
              <br />
              Waiting for Django backend connection...
            </p>
          )}
        </div>

        {/* Debug info */}
        {connectionStatus === 'connected' && backendInfo && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Backend timestamp: {backendInfo.timestamp || 'N/A'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}