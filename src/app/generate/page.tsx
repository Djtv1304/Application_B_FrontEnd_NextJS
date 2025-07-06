'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '../../components/Layout/MainLayout';
import { ProgressDialog } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import { apiService, apiUtils } from '../../services/api';

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

interface ProgressItem {
  filename: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

interface DownloadResult {
  success: boolean;
  filename: string;
  error?: string;
}

const GeneratePage = () => {
  const router = useRouter();
  const { 
    state, 
    setLoading, 
    setError, 
    clearError, 
    setGeneratedPDFs,
    clearAll,
  } = useApp();

  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState<ProgressItem[]>([]);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [downloadResults, setDownloadResults] = useState<DownloadResult[]>([]);

  useEffect(() => {
    // Check that we have the necessary data
    if (!state.selectedCategory || state.selectedSizes.length === 0) {
      console.log('⚠️ Missing data, redirecting...');
      router.push('/categories');
      return;
    }
    
    console.log('📋 Data for PDF generation:', {
      category: state.selectedCategory,
      sizes: state.selectedSizes
    });
  }, [state.selectedCategory, state.selectedSizes]);

  const handleGeneratePDF = async () => {
    try {
      setGenerationStatus('generating');
      setLoading(true);
      clearError();
      setDownloadResults([]);

      console.log('🎯 Starting PDF generation...');
      console.log('📂 Category:', state.selectedCategory);
      console.log('📏 Sizes:', state.selectedSizes);

      const result = await apiService.generatePDF(
        state.selectedCategory!,
        state.selectedSizes
      );

      console.log('✅ PDF generated successfully:', result);
      
      // Handle single or multiple response
      const pdfs = result.files || [result];
      setGeneratedPDFs(pdfs as any);
      setGenerationStatus('completed');
      
      // If single file, download automatically
      if (!result.files && result.download_url) {
        console.log('📥 Auto-downloading single file...');
        await handleSingleDownload(result as any);
      }

    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setGenerationStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleDownload = async (pdfData: any) => {
    try {
      console.log('📥 Downloading file:', pdfData.filename);
      await apiService.downloadPDF(pdfData.download_url, pdfData.filename);
      setDownloadResults([{ success: true, filename: pdfData.filename }]);
      console.log('✅ Download completed');
    } catch (error) {
      console.error('❌ Error downloading:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error downloading ${pdfData.filename}: ${errorMessage}`);
      setDownloadResults([{ success: false, filename: pdfData.filename, error: errorMessage }]);
    }
  };

  const handleDownloadAll = async () => {
    if (state.generatedPDFs.length === 0) return;

    console.log('📥 Starting multiple download...');
    setShowProgressDialog(true);
    setDownloadProgress([]);

    const results = await apiService.downloadMultiplePDFs(
      state.generatedPDFs,
      (progress) => {
        console.log('📊 Download progress:', progress);
        setDownloadProgress(prev => {
          const newProgress = [...prev];
          const existingIndex = newProgress.findIndex(p => p.filename === progress.filename);
          
          if (existingIndex >= 0) {
            newProgress[existingIndex] = progress as ProgressItem;
          } else {
            newProgress.push(progress as ProgressItem);
          }
          
          return newProgress;
        });
      }
    );

    console.log('✅ Multiple download completed:', results);
    setDownloadResults(results);
    
    // Close dialog after brief delay
    setTimeout(() => {
      setShowProgressDialog(false);
    }, 1000);
  };

  const handleStartOver = () => {
    console.log('🔄 Restart process...');
    clearAll();
    router.push('/');
  };

  const handleGoBack = () => {
    if (state.selectedCategory) {
      const encodedCategory = apiUtils.encodeCategory(state.selectedCategory);
      router.push(`/categories/${encodedCategory}/sizes`);
    } else {
      router.push('/categories');
    }
  };

  const getSuccessfulDownloads = () => {
    return downloadResults.filter(result => result.success).length;
  };

  const getFailedDownloads = () => {
    return downloadResults.filter(result => !result.success);
  };

  return (
    <MainLayout title="Generate Catalog">
      <div className="max-w-4xl mx-auto">
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
              Generate Catalog
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generate Catalog
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review your selection and generate the PDF catalog
          </p>
        </div>

        {/* Selection summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              📋
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Selection Summary</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <span className="ml-2 text-gray-900">{state.selectedCategory}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Selected sizes ({state.selectedSizes.length}):</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {state.selectedSizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    📏 {size}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-4">
              <p className="text-sm text-gray-600">
                {state.selectedSizes.length > 1 
                  ? `${state.selectedSizes.length} PDF files will be generated, one for each selected size.`
                  : `1 PDF file will be generated with products of the selected size.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Generation button */}
        {generationStatus === 'idle' && (
          <div className="text-center mb-6">
            <button
              onClick={handleGeneratePDF}
              disabled={state.loading}
              className={`px-8 py-3 text-lg font-medium rounded-md transition-all duration-200 ${
                state.loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {state.loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                <>🚀 Generate Catalog</>
              )}
            </button>
          </div>
        )}

        {/* Generation completed */}
        {generationStatus === 'completed' && state.generatedPDFs.length > 0 && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-green-800">
                    ✅ Catalog generated successfully! 
                    {state.generatedPDFs.length > 1 
                      ? ` ${state.generatedPDFs.length} PDF files were created.`
                      : ' 1 PDF file was created.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Generated files list */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  📄
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Generated Files</h2>
              </div>
              
              <div className="space-y-3">
                {state.generatedPDFs.map((pdf, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center text-xs font-medium mr-3">
                        PDF
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pdf.filename}</p>
                        <p className="text-sm text-gray-600">
                          {pdf.category} - Size {pdf.size} - {pdf.product_count} products
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download button */}
            <div className="text-center mb-6">
              <button
                onClick={handleDownloadAll}
                className="px-8 py-3 text-lg font-medium bg-black text-white rounded-md hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                📥 Download All PDFs
              </button>
            </div>
          </div>
        )}

        {/* Generation error */}
        {generationStatus === 'error' && (
          <div className="text-center mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">
                Error generating catalog. Please try again.
              </p>
            </div>
            <button
              onClick={handleGeneratePDF}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Download results */}
        {downloadResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Results</h2>
            
            {getSuccessfulDownloads() > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                <p className="text-green-800">
                  ✅ {getSuccessfulDownloads()} file{getSuccessfulDownloads() > 1 ? 's' : ''} downloaded successfully
                </p>
              </div>
            )}

            {getFailedDownloads().length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 mb-2">
                  ❌ Error downloading {getFailedDownloads().length} file{getFailedDownloads().length > 1 ? 's' : ''}:
                </p>
                <div className="space-y-1">
                  {getFailedDownloads().map((result, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="font-medium mr-2">{result.filename}:</span>
                      <span className="text-red-700">{result.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            onClick={handleStartOver}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            New Catalog
          </button>
        </div>

        {/* Progress dialog */}
        <ProgressDialog
          open={showProgressDialog}
          title="Downloading files..."
          progress={downloadProgress}
          currentStep={downloadProgress.length}
          totalSteps={state.generatedPDFs.length}
        />
      </div>
    </MainLayout>
  );
};

export default GeneratePage;