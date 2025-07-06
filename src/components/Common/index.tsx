'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ErrorBoundary Component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error captured by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto max-w-md py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">¡Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please reload the page or try again later.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// LoadingOverlay Component
interface LoadingOverlayProps {
  open?: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  open = true, 
  message = "Loading..." 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

// ErrorAlert Component
interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
  severity?: 'error' | 'warning' | 'info' | 'success';
  autoHideDuration?: number;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error, 
  onClose, 
  severity = "error", 
  autoHideDuration = 6000 
}) => {
  useEffect(() => {
    if (error && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [error, onClose, autoHideDuration]);

  if (!error) return null;

  const severityColors = {
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className={`border-l-4 p-4 rounded-md ${severityColors[severity]}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// ProgressDialog Component
interface ProgressItem {
  filename: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

interface ProgressDialogProps {
  open: boolean;
  title?: string;
  progress?: ProgressItem[];
  currentStep?: number;
  totalSteps?: number;
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({ 
  open, 
  title = "Downloading files...", 
  progress = [], 
  currentStep = 0, 
  totalSteps = 0 
}) => {
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">General Progress</span>
            <span className="text-sm text-gray-600">{currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* File list */}
        {progress.length > 0 && (
          <div className="max-h-60 overflow-y-auto">
            {progress.map((item, index) => (
              <div key={index} className="flex items-center gap-2 py-2">
                <div className="flex-shrink-0">
                  {item.status === 'completed' && <span className="text-green-500">✓</span>}
                  {item.status === 'error' && <span className="text-red-500">✗</span>}
                  {item.status === 'downloading' && <span className="text-blue-500">⬇</span>}
                  {item.status === 'pending' && <span className="text-gray-400">○</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${item.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                    {item.filename}
                  </p>
                  {item.error && (
                    <p className="text-xs text-red-500 truncate">{item.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// AnimatedCard Component
interface AnimatedCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, onClick, className = '' }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 active:translate-y-0 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// PageTransition Component
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '', style = {} }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      className={className}
      style={{
        ...style,
        opacity: mounted ? 1 : 0,
        transition: mounted ? 'opacity 0.3s ease-in-out' : 'none',
      }}
    >
      {children}
    </div>
  );
};

// Export all components
export {
  ErrorBoundary,
  LoadingOverlay,
  ErrorAlert,
  ProgressDialog,
  AnimatedCard,
  PageTransition,
};