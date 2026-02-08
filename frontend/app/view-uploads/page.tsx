'use client'

import { useState, useEffect } from 'react';
import ViewUploads from '@/components/viewUploads';

export default function ViewUploadPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate any initialization if needed
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <ViewUploads />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}