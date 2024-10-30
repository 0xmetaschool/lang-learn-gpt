'use client';
import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Container,
  Icon,
  Fade,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import { CheckIcon } from 'lucide-react';
import Link from 'next/link';
import useTypewriter from './hooks/useTypewriterEffect'; 

/**
 * @dev Feature component that displays a feature with an icon, title, and text.
 * @param {string} title - The title of the feature.
 * @param {string} text - The description of the feature.
 * @returns {JSX.Element} - The rendered Feature component.
 */
const Feature = ({ title, text }) => (
  <VStack spacing={3} align="center">
    <Icon as={CheckIcon} w={8} h={8} color="black" />
    <Text fontWeight="bold" fontSize="lg" color="black">{title}</Text>
    <Text textAlign="center" color="gray.600">{text}</Text>
  </VStack>
);

/**
 * @dev PriceWrapper component that wraps the pricing plan with additional styling.
 * @param {object} children - The child components.
 * @param {boolean} isRecommended - Whether the plan is recommended.
 * @returns {JSX.Element} - The rendered PriceWrapper component.
 */
const PriceWrapper = ({ children, isRecommended = false }) => (
  <Box
    shadow={isRecommended ? "2xl" : "lg"}
    borderWidth="1px"
    borderRadius="xl"
    borderColor={isRecommended ? "black" : "gray.200"}
    p={8}
    bg="white"
    position="relative"
    transform={isRecommended ? "scale(1.05)" : "none"}
    zIndex={isRecommended ? 1 : 0}
    height="450px" // Fixed height for all price wrappers
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    {isRecommended && (
      <Badge
        position="absolute"
        top="-4"
        left="50%"
        transform="translateX(-50%)"
        px={3}
        py={1}
        bg="black"
        color="white"
        fontWeight="bold"
        fontSize="sm"
        borderRadius="full"
      >
        Recommended
      </Badge>
    )}
    {children}
  </Box>
);

/**
 * @dev LandingPage component that displays the main landing page.
 * @returns {JSX.Element} - The rendered LandingPage component.
 */
export default function LandingPage() {
  const { isOpen, onToggle } = useDisclosure();
  
  useEffect(() => {
    onToggle();
  }, []);

  const heroText = useTypewriter(
    ['Learn English.', 'Aprender Español.', 'Apprendre le Français.', 'Lerne Deutsch.'],
    70,
    2000,
    75
  );

  return (
    <Box bg="white" color="black" minH="100vh">
      {/* Hero Section */}
      <Container maxW="6xl" pt={28} pb={40} textAlign="center">
        <VStack spacing={8}>
          <Fade in={isOpen}>
            <Heading as="h1" size="3xl" fontWeight="black" lineHeight="1.2">
              AI-Powered Language Learning
            </Heading>
          </Fade>
          <Fade in={isOpen} delay={0.5}>
            <Box height="80px" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="2xl" fontWeight="medium" color="black">
                {heroText}
              </Text>
            </Box>
          </Fade>
          <Fade in={isOpen} delay={1}>
            <Link href="/auth">
            <Button size="lg" bg="black" color="white" _hover={{ bg: 'gray.800' }}>
              Get Started for Free
            </Button>
            </Link>
          </Fade>
        </VStack>
      </Container>

      {/* Features Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="6xl" textAlign="center">
          <VStack spacing={10}>
            <Heading as="h2" size="xl" fontWeight="bold" color="black">
              Our Features
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <Feature
                title="AI-Powered Learning"
                text="Personalized lessons tailored to your learning style and pace."
              />
              <Feature
                title="Interactive Exercises"
                text="Engage with real-world scenarios to practice your skills."
              />
              <Feature
                title="Progress Tracking"
                text="Monitor your improvement with detailed analytics and insights."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box py={20}>
        <Container maxW="6xl" textAlign="center">
          <VStack spacing={12}>
            <Heading as="h2" size="xl" fontWeight="bold" color="black">
              Pricing Plans
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {/* Basic Plan */}
              <PriceWrapper>
                <VStack spacing={2} flex={1}>
                  <Text fontWeight="500" fontSize="2xl" color="black">Basic</Text>
                  <Heading as="h3" size="xl" color="black">$9.99</Heading>
                  <Text fontSize="lg" color="gray.500">per month</Text>
                  <VStack spacing={4} align="start" mt={4}>
                    <Text color="gray.600">1 language</Text>
                    <Text color="gray.600">Basic exercises</Text>
                  </VStack>
                </VStack>
                <Button mt={6} w="full" bg="black" color="white" _hover={{ bg: 'gray.800' }}>
                  Start Free Trial
                </Button>
              </PriceWrapper>

              {/* Pro Plan (Recommended) */}
              <PriceWrapper isRecommended={true}>
                <VStack spacing={2} flex={1}>
                  <Text fontWeight="500" fontSize="2xl" color="black">Pro</Text>
                  <Heading as="h3" size="xl" color="black">$19.99</Heading>
                  <Text fontSize="lg" color="gray.500">per month</Text>
                  <VStack spacing={4} align="start" mt={4}>
                    <Text color="gray.600">3 languages</Text>
                    <Text color="gray.600">Advanced exercises</Text>
                    <Text color="gray.600">Progress tracking</Text>
                  </VStack>
                </VStack>
                <Button mt={6} w="full" bg="black" color="white" _hover={{ bg: 'gray.800' }}>
                  Start Free Trial
                </Button>
              </PriceWrapper>

              {/* Enterprise Plan */}
              <PriceWrapper>
                <VStack spacing={2} flex={1}>
                  <Text fontWeight="500" fontSize="2xl" color="black">Enterprise</Text>
                  <Heading as="h3" size="xl" color="black">Custom</Heading>
                  <Text fontSize="lg" color="gray.500">per month</Text>
                  <VStack spacing={4} align="start" mt={4}>
                    <Text color="gray.600">Unlimited languages</Text>
                    <Text color="gray.600">Custom exercises</Text>
                    <Text color="gray.600">Dedicated support</Text>
                  </VStack>
                </VStack>
                <Button mt={6} w="full" bg="black" color="white" _hover={{ bg: 'gray.800' }}>
                  Contact Sales
                </Button>
              </PriceWrapper>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box bg="gray.50" color="black" py={20} minWidth="100vw">
        <Container maxW="4xl" textAlign="center">
          <Heading as="h2" size="xl" mb={6} fontWeight="bold">
            Start Your Language Learning Journey Today
          </Heading>
          <Text fontSize="xl" mb={8} color="gray.600">
            Join thousands of satisfied learners and unlock your potential with our AI-powered language app.
          </Text>
          <Link href="/auth">
          <Button size="lg" bg="black" color="white" _hover={{ bg: 'gray.800' }}>
            Sign Up Now
          </Button>
          </Link>
        </Container>
      </Box>
    </Box>
  );
}