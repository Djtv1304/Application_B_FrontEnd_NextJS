'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import MainLayout from '../../components/Layout/MainLayout';
import { AnimatedCard } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

const CategoriesPage = () => {
  const router = useRouter();
  const { 
    state, 
    setLoading, 
    setError, 
    clearError, 
    setCategories, 
    setSelectedCategory 
  } = useApp();
  
  const [selectedCategoryLocal, setSelectedCategoryLocal] = useState<string | null>(null);

  useEffect(() => {
    // Load categories if not in state
    if (state.categories.length === 0) {
      loadCategories();
    }
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      clearError();
      
      console.log('🔍 Loading categories from backend...');
      const data = await apiService.getCategories();
      console.log('✅ Categories loaded:', data);
      
      setCategories(data.categories || []);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategoryLocal(categoryName);
    console.log('📂 Category selected:', categoryName);
  };

  const handleContinue = () => {
    if (selectedCategoryLocal) {
      setSelectedCategory(selectedCategoryLocal);
      const encodedCategory = encodeURIComponent(selectedCategoryLocal);
      console.log('🚀 Navigating to sizes for:', selectedCategoryLocal);
      router.push(`/categories/${encodedCategory}/sizes`);
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  const handleRetry = () => {
    clearError();
    loadCategories();
  };

  // Render skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  // Render error
  if (state.error && state.categories.length === 0) {
    return (
      <MainLayout title="Available Categories">
        <div className="max-w-md mx-auto text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error loading categories</h2>
            <p className="text-red-700 mb-4">{state.error}</p>
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleGoBack}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Available Categories">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
            </li>
            <li className="before:content-['/'] before:mx-2">Categories</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select a Category
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the product category for your personalized catalog
          </p>
        </div>

        {/* Categories grid */}
        {state.loading ? (
          renderSkeleton()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {state.categories.map((category) => (
              <AnimatedCard
                key={category.name}
                onClick={() => handleCategorySelect(category.name)}
                className={`p-6 border-2 transition-all duration-200 ${
                  selectedCategoryLocal === category.name
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      📁
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  {selectedCategoryLocal === category.name && (
                    <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-1">📦</span>
                  <span>{category.count} products available</span>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* No categories message */}
        {!state.loading && state.categories.length === 0 && !state.error && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No categories available
            </h2>
            <p className="text-gray-600 mb-4">
              Verify that there are products in the database
            </p>
            <button
              onClick={handleRetry}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Reload
            </button>
          </div>
        )}

        {/* Selection info */}
        {selectedCategoryLocal && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800">
                <strong>Selected category:</strong> {selectedCategoryLocal}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Back to Home
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedCategoryLocal}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              selectedCategoryLocal
                ? 'bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedCategoryLocal ? `Continue with ${selectedCategoryLocal}` : 'Select a Category'} →
          </button>
        </div>

        {/* Statistics */}
        {state.categories.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-gray-100 rounded-lg px-6 py-3">
              <p className="text-sm text-gray-600">
                <strong>{state.categories.length}</strong> categories available • 
                <strong> {state.categories.reduce((sum, cat) => sum + cat.count, 0)}</strong> total products
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;