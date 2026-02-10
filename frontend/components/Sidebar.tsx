'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, MessageSquare, Settings, Zap, LogOut } from 'lucide-react';
import { useUser, UserButton, useAuth } from '@clerk/nextjs';

const navItems = [
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Upload', href: '/dashboard/upload', icon: Upload },
  { name: 'Embed', href: '/dashboard/embed', icon: Zap },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth(); // Use the hook directly

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md h-full transform transition-transform duration-300 ease-in-out md:translate-x-0 -translate-x-full md:static md:shadow-none">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-10 h-10 flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">CG</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">CoolGirls AI</h2>
          </div>
          {/* Mobile close button */}
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => document.body.classList.remove('sidebar-open')}
          >
            &times;
          </button>
        </div>
        
        {isSignedIn && (
          <div className="mt-4 flex items-center">
            <UserButton afterSignOutUrl="/" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.emailAddresses[0]?.emailAddress}</p>
              <p className="text-xs text-gray-500">Account</p>
            </div>
          </div>
        )}
      </div>
      
      <nav className="mt-8">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
          
          {/* Logout button - Fixed version */}
          {isSignedIn && (
            <li>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="flex items-center w-full px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-800 cursor-pointer"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}