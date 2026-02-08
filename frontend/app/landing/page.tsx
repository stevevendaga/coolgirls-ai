'use client';

import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:min-w-0 lg:flex-1">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-10 h-10 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">CG</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CoolGirls AI</span>
            </div>
          </div>
          <div className="flex items-center">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              <Link 
                href="/" 
                className="ml-4 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <Link 
                href="/sign-in" 
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign In
              </Link>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[90vh] px-4 sm:px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            CoolGirls AI
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Your personalized digital twin assistant powered by cutting-edge AI technology. 
            Experience intelligent conversations tailored just for you.
          </p>
          
          <SignedOut>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link 
                href="/sign-in" 
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started
              </Link>
              <Link 
                href="/sign-up" 
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Sign Up <span aria-hidden="true">→</span>
              </Link>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="mt-10">
              <Link 
                href="/" 
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go to Dashboard
              </Link>
            </div>
          </SignedIn>
        </div>
      </main>
      
      <footer className="py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm leading-6 text-gray-500">
            © {new Date().getFullYear()} CoolGirls AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}