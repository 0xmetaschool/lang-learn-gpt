'use client';

import React from 'react';
import { Flex } from '@chakra-ui/react';
import Auth from '../components/Auth';

/**
 * @dev AuthPage component that renders the authentication form.
 * @returns {JSX.Element} - The rendered AuthPage component.
 */
export default function AuthPage() {
  return (
    <Flex justify="center" align="center" minHeight="70vh">
      <Auth />
    </Flex>
  );
}
