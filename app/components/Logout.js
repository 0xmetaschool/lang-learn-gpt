'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * @dev Logout component that handles user logout.
 * @returns {JSX.Element} - The rendered Logout component.
 */
export default function Logout() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-black text-white py-2 px-4 rounded hover:bg-black-600"
    >
      Logout
    </button>
  );
}