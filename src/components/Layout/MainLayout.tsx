'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ErrorBoundary, LoadingOverlay } from '../Common';
import { useApp } from '../../context/AppContext';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title, 
  showBackButton = false 
}) => {
  const router = useRouter();
  const { state } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div 
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleHomeClick}
              >
                <Image
                  src="https://dudsclothes.com/wp-content/uploads/2023/07/DUDS-logo-retina.png"
                  alt="DUDS Logo"
                  width={mounted ? 120 : 120}
                  height={mounted ? 35 : 35}
                  className="object-contain"
                  priority
                />
              </div>

              {/* Title */}
              {title && (
                <div className="flex-1 text-center mx-4">
                  <h1 className="text-lg sm:text-xl font-medium text-gray-900 truncate">
                    {title}
                  </h1>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                {showBackButton && (
                  <button
                    onClick={handleBackClick}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Go back"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={handleHomeClick}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Go to home"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="min-h-[calc(100vh-200px)]">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} DUDS - Catalog Generator
              </p>
            </div>
          </div>
        </footer>

        {/* Global loading overlay */}
        {state.loading && <LoadingOverlay />}
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;