'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Lesson from '../../components/Lesson';

/**
 * @dev LessonPage component that renders a specific lesson.
 * @param {object} params - The route parameters.
 * @returns {JSX.Element} - The rendered LessonPage component.
 */
export default function LessonPage({ params }) {
  const searchParams = useSearchParams();
  const language = searchParams.get('language');
  const languageCode = searchParams.get('languageCode');
  const lessonTitle = searchParams.get('title');

  const lesson = {
    id: params.lessonId,
    title: lessonTitle,
  };

  console.log("lesson page", language);

  return (
    <div className="LessonPage">
      <Lesson
        lesson={lesson}
        language={language}
        languageCode={languageCode}
        onComplete={() => {
          // Handle lesson completion, e.g., navigate back to curriculum
          window.history.back();
        }}
      />
    </div>
  );
}