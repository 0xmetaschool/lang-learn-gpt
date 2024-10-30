'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Logout from './Logout';
import { usePathname } from 'next/navigation';

/**
 * @dev Navigation component for the application.
 * Displays navigation links and user authentication status.
 */
export default function Navigation() {
  const { user } = useAuth();
  const pathname = usePathname();

  /**
   * @dev Renders a navigation link with active state styling.
   * @param {string} href - The URL path for the link.
   * @param {ReactNode} children - The content of the link.
   */
  const NavLink = ({ href, children }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`text-gray-700 hover:text-black font-medium ${
          isActive ? 'text-black font-bold' : ''
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold text-black">Lang<span className="text-black">LearnGPT</span></span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/language-selector">Select Language</NavLink>
                <span className="text-gray-700 font-medium">{user.name}</span>
                <Logout className="text-gray-700 hover:text-black font-medium" />
              </>
            ) : (
              <Link href="/auth" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                Log in / Sign up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
