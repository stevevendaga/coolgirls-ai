'use client';

import { useState, useEffect } from 'react';
import { Menu, X, MessageSquare, Settings, Upload, Code, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useUser, useAuth } from '@clerk/nextjs';

type SidebarItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  // Check if mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Default to open on desktop
      } else {
        setIsOpen(false); // Default to closed on mobile
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sidebarItems: SidebarItem[] = [
    {
      label: 'AI Assistant',
      icon: <MessageSquare className="w-5 h-5" />,
      href: '/',
    },
    {
      label: 'Upload',
      icon: <Upload className="w-5 h-5" />,
      href: '/upload',
    },
    {
      label: 'Embed Chat',
      icon: <Code className="w-5 h-5" />,
      href: '/embed',
    },
    {
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
    },
  ];

  if (!isSignedIn) return null;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}
          flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-16 h-16 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          {isOpen && (
            <div className="ml-3">
              <h1 className="text-xl font-bold">CoolGirls AI</h1>
              <p className="text-sm text-gray-400">Digital Twin Assistant</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4">
          <ul>
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${
                    isOpen ? 'justify-start' : 'justify-center'
                  }`}
                >
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                  {isOpen && (
                    <span className="ml-3">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.firstName || user?.emailAddresses[0]?.emailAddress}</p>
                <button 
                  onClick={() => signOut()}
                  className="text-xs text-gray-400 hover:text-white flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}