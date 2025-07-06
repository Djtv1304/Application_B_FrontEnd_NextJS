import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

// Debug logging
if (DEBUG_MODE) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    debugMode: DEBUG_MODE,
  });
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 404:
          error.message = data?.error || 'Resource not found';
          break;
        case 500:
          error.message = data?.error || 'Internal server error';
          break;
        case 400:
          error.message = data?.error || 'Bad request';
          break;
        default:
          error.message = data?.error || `Server error (${status})`;
      }
    } else if (error.request) {
      error.message = 'Unable to connect to server. Check your internet connection.';
    }
    
    return Promise.reject(error);
  }
);

// Types
interface HealthCheckResponse {
  status: string;
  timestamp: string;
  message: string;
}

interface Category {
  name: string;
  count: number;
}

interface CategoriesResponse {
  categories: Category[];
}

interface SizeItem {
  size: string;
  count: number;
}

interface SizesResponse {
  sizes: SizeItem[];
}

interface GeneratedPDF {
  filename: string;
  download_url: string;
  category: string;
  size: string;
  product_count: number;
}

interface GeneratePDFResponse {
  files?: GeneratedPDF[];
  filename?: string;
  download_url?: string;
  category?: string;
  size?: string;
  product_count?: number;
}

interface ProgressCallback {
  (progress: {
    current: number;
    total: number;
    filename: string;
    status: 'downloading' | 'completed' | 'error';
    error?: string;
  }): void;
}

interface DownloadResult {
  success: boolean;
  filename: string;
  error?: string;
}

// API Service
export const apiService = {
  // Health check
  healthCheck: async (): Promise<HealthCheckResponse> => {
    try {
      const response = await apiClient.get('/health/');
      return response.data;
    } catch (error) {
      throw new Error(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get all categories
  getCategories: async (): Promise<CategoriesResponse> => {
    try {
      const response = await apiClient.get('/categories/');
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get sizes by category
  getSizesByCategory: async (category: string): Promise<SizesResponse> => {
    try {
      const encodedCategory = encodeURIComponent(category);
      const response = await apiClient.get(`/categories/${encodedCategory}/sizes/`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching sizes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Generate PDF
  generatePDF: async (category: string, sizes: string[]): Promise<GeneratePDFResponse> => {
    try {
      const payload = {
        category: category,
        sizes: Array.isArray(sizes) ? sizes : [sizes],
      };

      const response = await apiClient.post('/generate-pdf/', payload);
      return response.data;
    } catch (error) {
      throw new Error(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Download single PDF
  downloadPDF: async (downloadUrl: string, filename: string): Promise<boolean> => {
    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        timeout: 60000, // 60 seconds for downloads
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'catalog.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw new Error(`Error downloading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Download multiple PDFs
  downloadMultiplePDFs: async (
    pdfFiles: GeneratedPDF[], 
    onProgress?: ProgressCallback
  ): Promise<DownloadResult[]> => {
    const results: DownloadResult[] = [];
    const downloadDelay = parseInt(process.env.NEXT_PUBLIC_DOWNLOAD_DELAY || '500');
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      
      try {
        // Progress callback
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: pdfFiles.length,
            filename: file.filename,
            status: 'downloading'
          });
        }
        
        await apiService.downloadPDF(file.download_url, file.filename);
        
        results.push({
          success: true,
          filename: file.filename,
        });

        // Progress callback - completed
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: pdfFiles.length,
            filename: file.filename,
            status: 'completed'
          });
        }

        // Delay between downloads
        if (i < pdfFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, downloadDelay));
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          success: false,
          filename: file.filename,
          error: errorMessage
        });

        // Progress callback - error
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: pdfFiles.length,
            filename: file.filename,
            status: 'error',
            error: errorMessage
          });
        }
      }
    }
    
    return results;
  },
};

// API Utils
export const apiUtils = {
  // Encode category for URL
  encodeCategory: (category: string): string => {
    return encodeURIComponent(category);
  },

  // Decode category from URL
  decodeCategory: (encodedCategory: string): string => {
    return decodeURIComponent(encodedCategory);
  },

  // Validate URL
  isValidUrl: (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },

  // Format filename
  formatFilename: (category: string, size: string): string => {
    return `${category}_${size}.pdf`.replace(/[^a-z0-9._-]/gi, '_');
  },

  // Get connection status
  getConnectionStatus: async (): Promise<{ connected: boolean; error?: string }> => {
    try {
      await apiService.healthCheck();
      return { connected: true };
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
};

export default apiService;