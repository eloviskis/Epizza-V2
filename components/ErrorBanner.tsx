import React, { useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';

const ErrorBanner: React.FC = () => {
  const { transientError, setTransientError } = useAppContext();

  useEffect(() => {
    if (transientError) {
      const timer = setTimeout(() => {
        setTransientError(null);
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [transientError, setTransientError]);

  if (!transientError) {
    return null;
  }

  return (
    <div 
      className="fixed top-20 right-5 bg-red-600 text-white py-3 px-5 rounded-lg shadow-xl z-50 animate-fade-in flex items-center gap-4"
      role="alert"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>{transientError}</p>
      <button 
        onClick={() => setTransientError(null)} 
        className="text-white hover:bg-red-700 p-1 rounded-full -mr-2"
        aria-label="Fechar"
      >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
      </button>
    </div>
  );
};

export default ErrorBanner;