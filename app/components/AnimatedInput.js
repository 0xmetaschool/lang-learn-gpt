import React from 'react';
import { Input } from '@chakra-ui/react';
import useTypewriter from '../hooks/useTypewriterEffect';

/**
 * @dev AnimatedInput component that displays a typewriter effect in the placeholder.
 * @param {string} size - The size of the input field.
 * @param {string} value - The current value of the input field.
 * @param {function} onChange - The function to handle input changes.
 * @param {string} borderColor - The border color of the input field.
 * @param {object} props - Additional props to be passed to the Input component.
 * @returns {JSX.Element} - The rendered AnimatedInput component.
 */
const AnimatedInput = ({ size, value, onChange, borderColor, ...props }) => {
  const placeholders = [
    'Search for a language',
    'Rechercher une langue',
    'Buscar un idioma',
    'Suche nach einer Sprache',
    '言語を検索',
    'Buscar uma língua',
  ];

  const typedPlaceholder = useTypewriter(placeholders, 90, 1000, 90);

  return (
    <Input
      size={size}
      placeholder={typedPlaceholder}
      value={value}
      onChange={onChange}
      borderColor={borderColor}
      {...props}
    />
  );
};

export default AnimatedInput;