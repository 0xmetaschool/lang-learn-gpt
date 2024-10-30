import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Heading,
  Button,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  Spinner,
  HStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import AnimatedInput from './AnimatedInput'; 
import allowlist from '../../allowlist.json';

const MotionBox = motion(Box);

/**
 * @dev LanguageSelector component for selecting a language to learn.
 * Displays a list of available languages and allows users to search for a language.
 */
function LanguageSelector() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userLanguages, setUserLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { user, getToken } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('black.500', 'black.300');

  const sortedAllowedLanguages = allowlist.allowed_languages.sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    async function fetchUserLanguages() {
      if (!user) return;

      try {
        const token = await getToken();
        const response = await fetch('/api/user-languages', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user languages');
        }

        const data = await response.json();
        // Capitalize, remove duplicates, and sort alphabetically
        const uniqueLanguages = Array.from(new Set(data.languages.map(lang => lang.name)))
          .map(name => {
            const language = data.languages.find(lang => lang.name === name);
            return {
              ...language,
              name: language.name.charAt(0).toUpperCase() + language.name.slice(1)
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        setUserLanguages(uniqueLanguages);
      } catch (error) {
        console.error('Error fetching user languages:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserLanguages();
  }, [user, getToken]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm) {
      const languageName = searchTerm.trim();
      if (!sortedAllowedLanguages.includes(languageName)) {
        setErrorMessage(`${languageName} is not available for learning at this time.`);
        return;
      }

      try {
        const token = await getToken();
        const languageCode = languageName.toLowerCase().slice(0, 2);
        await fetch('/api/user-languages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ languageCode, languageName })
        });

        router.push(`/curriculum/${languageCode}?name=${encodeURIComponent(languageName)}`);
      } catch (error) {
        console.error('Error adding user language:', error);
        setErrorMessage('An error occurred while adding the language. Please try again.');
      }
    }
  };

  const handleLanguageSelect = (language) => {
    if (!sortedAllowedLanguages.includes(language.name)) {
      setErrorMessage(`${language.name} is not available for learning at this time.`);
      return;
    }
    router.push(`/curriculum/${language.code}?name=${encodeURIComponent(language.name)}`);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Capitalize only the first letter, even if user enters in all caps
    setSearchTerm(value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()); 
    setErrorMessage('');
  };

  if (isLoading) {
    return (
      <Container maxW="4xl" py={16}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center" color="black.500">
            Loading Your Language Journey
          </Heading>
          <Box textAlign="center">
            <Spinner size="xl" color="black.500" />
          </Box>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={16}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center" color="black.500">
          Discover Your Next Language Adventure
        </Heading>
        
        <Box as="form" onSubmit={handleSearch}>
          <VStack spacing={4}>
            <HStack width="full">
              <AnimatedInput
                size="lg"
                value={searchTerm}
                onChange={handleInputChange}
                borderColor={borderColor}
                _hover={{ borderColor: 'black.300' }}
                _focus={{ borderColor: 'black.500', boxShadow: 'outline' }}
                flex={1}
              />
              <Button
                color="black"
                size="lg"
                type="submit"
              >
                Search
              </Button>
            </HStack>
          </VStack>
        </Box>

        {errorMessage && (
          <Alert status="error">
            <AlertIcon />
            {errorMessage}
          </Alert>
        )}

        {userLanguages.length > 0 && (
          <Box>
            <Heading as="h2" size="xl" mb={4} color="black.400">
              Continue Learning
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {userLanguages.map((language) => (
                <MotionBox
                  key={language.code}
                  as="button"
                  onClick={() => handleLanguageSelect(language)}
                  bg={bgColor}
                  p={6}
                  borderRadius="lg"
                  boxShadow="md"
                  textAlign="left"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="xl" fontWeight="bold">{language.name}</Text>
                    <Text color="gray.500">Continue your {language.name} journey!</Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default LanguageSelector;
