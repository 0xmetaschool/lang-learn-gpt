'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from '../components/LanguageSelector';

/**
 * @dev LanguageSelectorPage component that renders the language selector.
 * @returns {JSX.Element} - The rendered LanguageSelectorPage component.
 */
export default function LanguageSelectorPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) {
        router.push('/auth');
      }
    };
    checkAuth();
  }, [router, getToken]);

  if (!user) {
    return null; // or a loading spinner
  }

  return <LanguageSelector />;
}