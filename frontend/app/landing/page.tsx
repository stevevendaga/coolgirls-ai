'use client';

import { SignedIn, SignedOut, RedirectToSignIn, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { Bot } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-purple-100">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:min-w-0 lg:flex-1">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-10 h-10 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg"><Bot></Bot> </span>
              </div>
              <span className="text-xl font-bold text-pink-500">CoolGirls AI</span>
            </div>
          </div>
          <div className="flex items-center">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              <Link 
                href="/dashboard" 
                className="ml-4 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button 
                  className="mr-4 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button 
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[90vh] px-4 sm:px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-blue-600 sm:text-6xl">
            CoolGirls AI Assistant
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            A customized AI assistant powered by cutting-edge AI technology. 
            Experience intelligent conversations tailored just for Cool Girls.

            {/* Your personalized digital twin assistant powered by cutting-edge AI technology. 
            Experience intelligent conversations tailored just for you. */}
          </p>
          
          <SignedOut>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignInButton mode="modal">
                <button 
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                >
                  Get Started
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button 
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="mt-10">
              <Link 
                href="/dashboard" 
                className="inline-block rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-purple-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </SignedIn>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} CoolGirls AI. All rights reserved.
      </footer>
    </div>
  );
}