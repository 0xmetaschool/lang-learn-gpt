'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import SignUp from './SignUp';
import Login from './Login';

/**
 * @dev Auth component that handles user authentication (sign up and login).
 * @returns {JSX.Element} - The rendered Auth component.
 */
export default function Auth() {
  const [showSignUp, setShowSignUp] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // @dev Redirect to the language selector if the user is already authenticated
  if (user) {
    router.push('/language-selector');
    return null;
  }

  return (
    <div className="max-w-50 mx-auto mt-8">
      {showSignUp ? (
        <>
          <SignUp />
          <p className="mt-4 text-center">
            Already have an account?{' '}
            <button
              onClick={() => setShowSignUp(false)}
              className="text-blue-500 hover:underline"
            >
              Log in
            </button>
          </p>
        </>
      ) : (
        <>
          <Login />
          <p className="mt-4 text-center">
            Don't have an account?{' '}
            <button
              onClick={() => setShowSignUp(true)}
              className="text-blue-500 hover:underline"
            >
              Sign up
            </button>
          </p>
        </>
      )}
    </div>
  );
}