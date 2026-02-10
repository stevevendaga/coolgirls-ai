// components/MobileMenuButton.tsx
'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export default function MobileMenuButton() {
  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar-open');
  };

  return (
    <button
      type="button"
      className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
      onClick={toggleSidebar}
    >
      <span className="sr-only">Open sidebar</span>
      <Menu className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}