'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Curriculum from '../../components/Curriculum';

/**
 * @dev CurriculumPage component that renders the curriculum for a specific language.
 * @param {object} params - The route parameters.
 * @returns {JSX.Element} - The rendered CurriculumPage component.
 */
export default function CurriculumPage({ params }) {
  const searchParams = useSearchParams();
  const languageName = searchParams.get('name');
  
  return <Curriculum languageCode={params.languageCode} language={languageName} />;
}