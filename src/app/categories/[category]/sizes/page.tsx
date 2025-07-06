'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '../../../../components/Layout/MainLayout';
import { AnimatedCard } from '../../../../components/Common';
import { useApp } from '../../../../context/AppContext';
import { apiService } from '../../../../services/api';

const SizesPage = () => {
  const router = useRouter();
  const params = useParams();
  const encodedCategory = params.category as string;
  const { 
    state, 
    setLoading, 
    setError, 
    clearError, 
    setAvailableSizes,
    setSelectedSizes,
    addSelectedSize,
    removeSelectedSize,
  } = useApp();

  const [localSelectedSizes, setLocalSelectedSizes] = useState<string[]>([]);
  const categoryName = encodedCategory ? decodeURIComponent(encodedCategory) : '';

  useEffect(() => {
    if (encodedCategory) {
      loadSizes();
    }
  }, [encodedCategory]);

  useEffect(() => {
    // Sync with global state
    setLocalSelectedSizes(state.selectedSizes);
  }, [state.selectedSizes]);

  const loadSizes = async () => {
    if (!categoryName) return;

    try {
      setLoading(true);
      clearError();
      
      console.log('🔍 Loading sizes for category:', categoryName);
      const data = await apiService.getSizesByCategory(categoryName);
      console.log('✅ Sizes loaded:', data);
      
      setAvailableSizes(data.sizes || []);
    } catch (error) {
      console.error('❌ Error loading sizes:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSizeToggle = (size: string) => {
    const isSelected = localSelectedSizes.includes(size);
    
    console.log('👕 Toggle size:', size, isSelected ? 'deselect' : 'select');
    
    if (isSelected) {
      removeSelectedSize(size);
    } else {
      addSelectedSize(size);
    }
  };

  const handleSelectAll = () => {
    const allSizes = state.availableSizes.map(item => item.size);
    console.log('✅ Select all sizes:', allSizes);
    setSelectedSizes(allSizes);
  };

  const handleClearAll = () => {
    console.log('🗑️ Clear size selection');
    setSelectedSizes([]);
  };

  const handleGeneratePDF = () => {
    if (localSelectedSizes.length > 0) {
      console.log('🎯 Navigating to PDF generation with sizes:', localSelectedSizes);
      router.push('/generate');
    }
  };

  const handleGoBack = () => {
    router.push('/categories');
  };

  const handleRetry = () => {
    clearError();
    loadSizes();
  };

  // Check if category is selected in state
  useEffect(() => {
    if (categoryName && state.selectedCategory !== categoryName) {
      // If doesn't match, redirect to categories
      console.log('⚠️ Category not selected, redirecting...');
      router.push('/categories');
    }
  }, [categoryName, state.selectedCategory]);

  // Render skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Render error
  if (state.error && state.availableSizes.length === 0) {
    return (
      <MainLayout title="Select Sizes">
        <div className="max-w-md mx-auto text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error loading sizes</h2>
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
                ← Back to Categories
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Select Sizes">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <Link href="/categories" className="hover:text-gray-700 transition-colors">
                Categories
              </Link>
            </li>
            <li className="before:content-['/'] before:mx-2 text-gray-700">
              {categoryName}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Sizes
          </h1>
          <h2 className="text-xl text-blue-600 mb-2">
            {categoryName}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose one or more sizes to include in your catalog
          </p>
        </div>

        {/* Selection controls */}
        {!state.loading && state.availableSizes.length > 0 && (
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleSelectAll}
              disabled={localSelectedSizes.length === state.availableSizes.length}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              disabled={localSelectedSizes.length === 0}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Sizes grid */}
        {state.loading ? (
          renderSkeleton()
        ) : (
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available Sizes</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {state.availableSizes.map((sizeItem) => {
                const isSelected = localSelectedSizes.includes(sizeItem.size);
                
                return (
                  <AnimatedCard
                    key={sizeItem.size}
                    onClick={() => handleSizeToggle(sizeItem.size)}
                    className={`p-4 min-h-[80px] border-2 transition-all duration-200 flex flex-col items-center justify-center relative ${
                      isSelected
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Selection indicator */}
                    <div className="mb-2">
                      {isSelected ? (
                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
                          ✓
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>

                    {/* Size */}
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${isSelected ? 'text-black' : 'text-gray-900'}`}>
                        {sizeItem.size}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center justify-center">
                        <span className="mr-1">📏</span>
                        {sizeItem.count} products
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          </div>
        )}

        {/* No sizes message */}
        {!state.loading && state.availableSizes.length === 0 && !state.error && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📏</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No sizes available for this category
            </h2>
            <p className="text-gray-600 mb-4">
              Verify that there are products with stock for {categoryName}
            </p>
            <button
              onClick={handleGoBack}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              ← Back to Categories
            </button>
          </div>
        )}

        {/* Selection info */}
        {localSelectedSizes.length > 0 && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-blue-800 font-medium">
                  Selected sizes ({localSelectedSizes.length}):
                </span>
                {localSelectedSizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                    <span className="ml-2 text-xs">✕</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={localSelectedSizes.length === 0}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              localSelectedSizes.length > 0
                ? 'bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Generate Catalog ({localSelectedSizes.length}) 📄
          </button>
        </div>

        {/* Statistics */}
        {state.availableSizes.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-gray-100 rounded-lg px-6 py-3">
              <p className="text-sm text-gray-600">
                <strong>{state.availableSizes.length}</strong> sizes available • 
                <strong> {state.availableSizes.reduce((sum, item) => sum + item.count, 0)}</strong> total products
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SizesPage;