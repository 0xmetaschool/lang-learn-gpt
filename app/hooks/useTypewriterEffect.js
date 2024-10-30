import { useState, useEffect } from 'react';

/**
 * @dev Custom hook to create a typewriter effect.
 * @param {Array} texts - Array of strings to be displayed.
 * @param {number} typingSpeed - Speed of typing in milliseconds.
 * @param {number} pauseDuration - Duration of pause after typing a string in milliseconds.
 * @param {number} backspaceSpeed - Speed of backspacing in milliseconds.
 * @returns {string} - The current text being displayed.
 */
const useTypewriter = (texts = [], typingSpeed = 150, pauseDuration = 2000, backspaceSpeed = 100) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (texts.length === 0) return;

    let timeoutId;

    const typeWriterEffect = () => {
      if (isTyping) {
        // Typing phase
        if (currentIndex < texts[textIndex].length) {
          setDisplayText((prev) => prev + texts[textIndex].charAt(currentIndex));
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Once fully typed, pause before backspacing
          timeoutId = setTimeout(() => setIsTyping(false), pauseDuration);
        }
      } else {
        // Backspacing phase
        if (currentIndex > 0) {
          setDisplayText((prev) => prev.slice(0, -1));
          setCurrentIndex((prev) => prev - 1);
        } else {
          // Once fully erased, move to the next text
          setIsTyping(true); // Reset typing state
          setTextIndex((prev) => (prev + 1) % texts.length); // Loop through texts
          setDisplayText(''); // Clear the displayText before starting the next string
        }
      }
    };

    const speed = isTyping ? typingSpeed : backspaceSpeed;
    timeoutId = setTimeout(typeWriterEffect, speed);

    return () => clearTimeout(timeoutId); // Cleanup the timeout
  }, [texts, currentIndex, isTyping, textIndex, typingSpeed, pauseDuration, backspaceSpeed]);

  return displayText;
};

export default useTypewriter;