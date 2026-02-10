import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <SignedIn>
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to CoolGirls AI Assistant</h1>
          <p className="text-gray-600 mb-6">
            {/* Your personalized digital twin assistant platform. Access all features from the sidebar. */}
             A customized AI assistant powered by cutting-edge AI technology. 
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/chat"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white text-center hover:opacity-90 transition-opacity"
            >
              <MessageSquare className="mx-auto h-8 w-8 mb-2" />
              <h3 className="font-semibold">Chat</h3>
              <p className="text-sm opacity-80 mt-1">Start a conversation with the  AI</p>
            </Link>
            
            <Link 
              href="/dashboard/upload"
              className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-6 text-white text-center hover:opacity-90 transition-opacity"
            >
              <Upload className="mx-auto h-8 w-8 mb-2" />
              <h3 className="font-semibold">Upload</h3>
              <p className="text-sm opacity-80 mt-1">Upload documents to knowledge base</p>
            </Link>
            
            <Link 
              href="/dashboard/embed"
              className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg p-6 text-white text-center hover:opacity-90 transition-opacity"
            >
              <Zap className="mx-auto h-8 w-8 mb-2" />
              <h3 className="font-semibold">Embed</h3>
              <p className="text-sm opacity-80 mt-1">
                {/* Embed your AI twin anywhere */}
                Embed your AI anywhere
              </p>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <p className="text-gray-600">Your recent activity will appear here.</p>
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}

import { MessageSquare, Upload, Zap } from 'lucide-react';