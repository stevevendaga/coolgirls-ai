'use client';

import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect('/sign-in');
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-20 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}