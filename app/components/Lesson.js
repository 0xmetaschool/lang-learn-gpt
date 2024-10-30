'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation'; // Add useRouter
import {
  Box,
  Heading,
  Text,
  Button,
  Progress,
  Alert,
  AlertIcon,
  Spinner,
  VStack,
  HStack,
  Center,
  Container,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FaPlay, FaMicrophone, FaMicrophoneSlash, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

/**
 * @dev Lesson component for displaying and interacting with a language lesson.
 * @param {Object} props - The component props.
 * @param {Object} props.lesson - The lesson data.
 * @param {string} props.language - The language of the lesson.
 * @param {string} props.languageCode - The language code.
 * @param {Function} props.onComplete - Callback for when the lesson is completed.
 * @param {string} [props.nextLessonId] - The ID of the next lesson.
 * @param {Function} [props.onNavigateToNextLesson] - Callback for navigating to the next lesson.
 * @param {Function} [props.onBackToCurriculum] - Callback for navigating back to the curriculum.
 */
function Lesson({ lesson, language, languageCode, onComplete, nextLessonId, onNavigateToNextLesson, onBackToCurriculum }) {
  const { user, getToken } = useAuth();
  const router = useRouter(); 
  const [content, setContent] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioCache, setAudioCache] = useState({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingGuidedAudio, setIsPlayingGuidedAudio] = useState(false);
  const recognition = useRef(null);
  const isRecognitionInitialized = useRef(false);
  const audioRef = useRef(null);
  const guidedAudioRef = useRef(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [unlockedExercises, setUnlockedExercises] = useState([0]); // Start with the first exercise unlocked

  const searchParams = useSearchParams();

  const memoizedLesson = useMemo(() => lesson, [lesson]);
  const memoizedUser = useMemo(() => user, [user]);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Initialize Audio objects only on the client side
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      guidedAudioRef.current = new Audio();
    }
  }, []);

  useEffect(() => {
    console.log('useEffect triggered');
    async function fetchLessonContentAndProgress() {
      if (!memoizedUser) return;

      try {
        setIsLoading(true);
        const token = await getToken();

        // Get the startIndex from URL parameters
        const startIndex = parseInt(searchParams.get('startExercise') || '0', 10);
        console.log('Start index:', startIndex);
        setCurrentExerciseIndex(startIndex);

        const [lessonResponse, progressResponse] = await Promise.all([
          fetch('/api/generate-lesson', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              language, 
              languageCode, 
              lessonTitle: memoizedLesson.title,
              lessonId: memoizedLesson.id
            }),
          }),
          fetch(`/api/user-progress?userId=${memoizedUser.id}&languageCode=${languageCode}&lessonId=${memoizedLesson.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
        ]);

        if (!lessonResponse.ok || !progressResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [lessonData, progressData] = await Promise.all([
          lessonResponse.json(),
          progressResponse.json(),
        ]);

        console.log('Received lesson content:', lessonData);
        if (!lessonData || !lessonData.content || !lessonData.content.exercises || !Array.isArray(lessonData.content.exercises)) {
          throw new Error('Invalid lesson content structure received');
        }

        setContent(lessonData.content);
        setUserProgress(progressData);
        console.log('Content set in state:', lessonData.content);
        await prepareAudio(lessonData.content.exercises);
      } catch (err) {
        console.error('Error fetching lesson content:', err);
        setError(`Failed to generate lesson content: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    if (memoizedUser && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchLessonContentAndProgress();
    }
  }, [memoizedLesson, language, languageCode, memoizedUser, getToken, searchParams]);

  const prepareAudio = async (exercises) => {
    console.log('Preparing audio');
    setIsGeneratingAudio(true);
    const newAudioCache = { ...audioCache };
    for (const exercise of exercises) {
      if (exercise.type === 'listen_and_repeat' && exercise.audio) {
        newAudioCache[exercise.phrase] = exercise.audio;
      }
    }
    setAudioCache(newAudioCache);
    setIsGeneratingAudio(false);
    console.log('Audio preparation complete');
    await playGuidedAudio(currentExerciseIndex === 0 ? `Welcome to the lesson: ${memoizedLesson.title}. Let's begin with the first exercise.` : `Welcome back to the lesson: ${memoizedLesson.title}. Let's continue with the next exercise.`);
  };

  const generateAudio = async (text, lang = 'en') => {
    console.log('Generating audio for:', text, 'in language:', lang);
    const response = await fetch('/api/generate-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language: lang }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate audio');
    }

    return await response.blob();
  };

  const playAudioBlob = async (audioBlob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    guidedAudioRef.current.src = audioUrl;
    await new Promise((resolve) => {
      guidedAudioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      guidedAudioRef.current.play();
    });
  };

  const playGuidedAudio = useCallback(async (text, targetLanguage) => {
    console.log('Playing guided audio:', text, 'in language:', targetLanguage);
    if (isPlayingGuidedAudio || !guidedAudioRef.current) {
      console.log('Guided audio is already playing or not initialized. Skipping:', text);
      return;
    }
    
    setIsPlayingGuidedAudio(true);
    try {
      const parts = text.split(/(".*?")/);
      
      for (const part of parts) {
        if (part.startsWith('"') && part.endsWith('"')) {
          const targetText = part.slice(1, -1);
          if (audioCache[targetText]) {
            guidedAudioRef.current.src = audioCache[targetText];
            await guidedAudioRef.current.play();
          } else {
            const audioBlob = await generateAudio(targetText, targetLanguage);
            await playAudioBlob(audioBlob);
          }
        } else if (part.trim() !== '') {
          const audioBlob = await generateAudio(part, 'en');
          await playAudioBlob(audioBlob);
        }
      }
    } catch (error) {
      console.error('Error playing guided audio:', error);
    } finally {
      setIsPlayingGuidedAudio(false);
      console.log('Guided audio playback ended');
    }
  }, [isPlayingGuidedAudio, audioCache]);

  console.log('audioCache:', audioCache);
  const speakPhrase = async (phrase) => {
    console.log('Speaking phrase:', phrase);
    try {
      if (audioRef.current && audioCache[phrase]) {
        // Clean up the base64 string
        const cleanBase64 = audioCache[phrase].replace(/^data:audio\/\w+;base64,/, '');
        const audioBlob = await base64ToBlob(cleanBase64);
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      } else {
        console.error('Audio not found for phrase:', phrase);
        await regenerateAndPlayAudio(phrase);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setFeedback("There was an error playing the audio. Please try again.");
    }
    await playGuidedAudio("Now, please repeat the phrase.", language);
  };

  const regenerateAndPlayAudio = async (phrase) => {
    try {
      const audioBlob = await generateAudio(phrase, language);
      const base64Audio = await blobToBase64(audioBlob);
      const audio = new Audio(base64Audio);
      await audio.play();
      // Update the cache with the new audio
      setAudioCache(prevCache => ({
        ...prevCache,
        [phrase]: base64Audio
      }));
    } catch (error) {
      console.error('Error regenerating audio:', error);
      setFeedback("There was an error generating the audio. Please try again.");
    }
  };

  // Function to decode base64 Opus and play the audio
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const transcribeAndCheckAudio = async (audioBlob) => {
    console.log('Transcribing and checking audio, blob size:', audioBlob.size);
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('language', language);
    formData.append('correctPhrase', content.exercises[currentExerciseIndex].phrase);
  
    console.log('Sending transcription and check request for language:', language);
  
    try {
      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });
  
      console.log('Received response from transcribe-audio API, status:', response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Transcription API error:', errorData);
        throw new Error(errorData.error || 'Failed to transcribe and check audio');
      }
  
      const data = await response.json();
      console.log('Transcription and check API response:', data);
  
      if (!data.transcribedText || !data.feedback) {
        throw new Error('Invalid response received');
      }

      setFeedback(data.feedback);
      if (data.isCorrect) {
        setCorrectAnswers(prev => prev + 1);
        if (currentExerciseIndex + 1 < content.exercises.length) {
          setUnlockedExercises(prev => [...prev, currentExerciseIndex + 1]);
        }
        await saveProgress(currentExerciseIndex, true);  // Save progress when exercise is correct
      }

      await playGuidedAudio(data.feedback, language);

      return data.transcribedText;
    } catch (error) {
      console.error('Transcription and check error:', error);
      setFeedback('Sorry, there was an error processing your speech. Please try again.');
      return null;
    }
  };

  const startRecording = useCallback(() => {
    console.log('Starting recording');
    setIsListening(true);
    audioChunksRef.current = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorderRef.current.start();
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
        setFeedback('Unable to access microphone. Please check your settings and try again.');
      });
  }, []);

  const stopRecording = useCallback(async () => {
    console.log('Stopping recording');
    setFeedback(null);
    setIsListening(false);
    setIsTranscribing(true);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      return new Promise((resolve) => {
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log('Recording stopped, blob size:', audioBlob.size);
          try {
            await transcribeAndCheckAudio(audioBlob);
          } catch (error) {
            console.error('Transcription and check error:', error);
            setFeedback('Sorry, there was an error processing your speech. Please try again.');
          } finally {
            setIsTranscribing(false);
            resolve();
          }
        };
        mediaRecorderRef.current.stop();
      });
    } else {
      console.log('MediaRecorder is not active');
      setIsTranscribing(false);
    }
  }, [transcribeAndCheckAudio]);

  const initializeSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window && !isRecognitionInitialized.current && content) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = language;

      recognition.current.onresult = (event) => {
        const userSaid = event.results[0][0].transcript;
        console.log('Speech recognized:', userSaid);
        transcribeAndCheckAudio(userSaid);
      };

      recognition.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      isRecognitionInitialized.current = true;
      console.log('Speech recognition initialized');
    }
  }, [language, transcribeAndCheckAudio, content]);

  useEffect(() => {
    if (content) {
      initializeSpeechRecognition();
    }
  }, [content, initializeSpeechRecognition]);

  const saveProgress = async (exerciseIndex, completed = false) => {
    try {
      const token = await getToken();
      const response = await fetch('/api/save-progress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          languageCode,
          lessonId: memoizedLesson.id,
          exerciseIndex,
          completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      const result = await response.json();
      console.log('Progress saved:', result);

      // Update local state to reflect the saved progress
      setUserProgress(prevProgress => ({
        ...prevProgress,
        exerciseIndex,
        completed: completed || prevProgress.completed
      }));

    } catch (error) {
      console.error('Error saving progress:', error);
      setFeedback("There was an error saving your progress. Your results may not be recorded.");
    }
  };

  const nextExercise = async () => {
    console.log('Moving to next exercise');
    if (currentExerciseIndex < content.exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      if (unlockedExercises.includes(nextIndex)) {
        setCurrentExerciseIndex(nextIndex);
        setFeedback(null);
        await saveProgress(nextIndex, false);  // Save progress for the new exercise
        const nextMessage = "Great! Let's move on to the next phrase.";
        playGuidedAudio(nextMessage);
      } else {
        setFeedback("Please complete the current exercise correctly before moving to the next one.");
      }
    } else {
      console.log('Lesson completed');
      const allExercisesCorrect = correctAnswers === content.exercises.length;
      await saveProgress(currentExerciseIndex, allExercisesCorrect);  // Save final progress
      onComplete();
      const completionMessage = allExercisesCorrect 
        ? "Congratulations! You've completed this lesson perfectly." 
        : "You've finished the lesson. You may want to review this lesson later.";
      playGuidedAudio(completionMessage);
    }
  };

  useEffect(() => {
    console.log('Content updated:', content);
  }, [content]);

  // UI Components
  const LoadingSpinner = () => (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="black" thickness="4px" speed="0.65s" />
        {/* Add random fun text */}
        <Text fontSize="xl" fontWeight="medium" color="gray.600">
          {getRandomLoadingText()}
        </Text>
      </VStack>
    </Center>
  );

  // Helper function to get a random loading text
  const getRandomLoadingText = () => {
    const loadingTexts = [
      "Brewing up an exciting lesson...",
      "Crafting an immersive language experience...",
      "Preparing your language adventure...",
      "Mixing the perfect blend of education and fun...",
      "Assembling the building blocks of fluency...",
      "Generating a dose of language inspiration...",
    ];
    
    return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
  };

  const ErrorMessage = ({ message }) => (
    <Container maxW="xl" centerContent>
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" bg="red.50" rounded="xl">
        <AlertIcon boxSize="40px" mr={0} />
        <Text fontWeight="bold" fontSize="xl" mt={4}>Error</Text>
        <Text mt={2}>{message}</Text>
        <Text mt={2}>Please try refreshing the page or selecting a different lesson.</Text>
      </Alert>
    </Container>
  );

  const ProgressBar = () => {
    if (!content || !content.exercises) return null;
    const progress = (currentExerciseIndex / content.exercises.length) * 100;
    return (
      <Progress value={progress} colorScheme="blue" size="sm" rounded="full" />
    );
  };

  const ExercisePrompt = ({ prompt }) => (
    <Text fontSize="xl" fontWeight="medium" mb={4} color="gray.700">{prompt}</Text>
  );

  const handleSpeakClick = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleBackToCurriculum = async () => {
    console.log('Navigating back to curriculum');
    await router.push(`/curriculum/${languageCode}?name=${encodeURIComponent(language)}`);
  };

  if (!memoizedUser) {
    return (
      <Container maxW="xl" centerContent>
        <Box p={8} mt={10} bg="white" rounded="xl" shadow="lg" textAlign="center">
          <Heading as="h2" size="xl" mb={6} color="black">Please log in to access lessons</Heading>
        </Box>
      </Container>
    );
  }

  if (isLoading || isGeneratingAudio) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!content || !content.introduction || !Array.isArray(content.exercises) || content.exercises.length === 0) {
    return <ErrorMessage message="Invalid lesson content received. Please try again." />;
  }

  const handleNextLesson = () => {
    console.log('Navigating to next lesson');
    if (nextLessonId && onNavigateToNextLesson) {
      onNavigateToNextLesson(nextLessonId);
    }
  };

  return (
    <Container maxW="xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={handleBackToCurriculum}
          colorScheme="gray"
          variant="outline"
          alignSelf="flex-start"
          mb={4}
          size="sm"
        >
          Back to Curriculum
        </Button>

        <Heading as="h2" size="xl" textAlign="center" color="black">{memoizedLesson.title}</Heading>
        <ProgressBar />
        {currentExerciseIndex === 0 && content && content.introduction && (
          <Text color="gray.600" fontSize="lg" textAlign="center">{content.introduction}</Text>
        )}
        {content && content.exercises && content.exercises[currentExerciseIndex] && (
          <Box bg="gray.50" p={6} rounded="xl" shadow="md">
            <ExercisePrompt prompt={content.exercises[currentExerciseIndex].prompt} />
            <VStack spacing={4} align="stretch">
              <Text fontSize="xl" fontWeight="bold" color="gray.800">{content.exercises[currentExerciseIndex].phrase}</Text>
              <Text color="gray.600" fontStyle="italic">{content.exercises[currentExerciseIndex].translation}</Text>
              <Flex justify="center" mt={4}>
                <Tooltip label="Listen">
                  <IconButton
                    icon={<FaPlay />}
                    onClick={() => speakPhrase(content.exercises[currentExerciseIndex].phrase)}
                    colorScheme="blue"
                    size="lg"
                    isRound
                    mr={4}
                  />
                </Tooltip>
                <Tooltip label={isListening ? 'Stop' : 'Speak'}>
                  <Button
                    leftIcon={isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                    onClick={handleSpeakClick} 
                    colorScheme={isListening ? 'red' : 'green'}
                    size="lg"
                    isDisabled={isTranscribing}
                    isLoading={isTranscribing}
                  >
                    {isListening ? 'Stop' : isTranscribing ? 'Checking Answer' : 'Speak'}
                  </Button>
                </Tooltip>
              </Flex>
            </VStack>
          </Box>
        )}
        {feedback && (
          <Alert status={feedback.startsWith('Excellent') ? 'success' : 'error'} variant="subtle" rounded="md">
            <AlertIcon />
            <Text fontWeight="medium">{feedback}</Text>
          </Alert>
        )}
        {feedback && feedback.startsWith('Excellent') && (
          <Center>
            <Button
              rightIcon={<FaArrowRight />}
              onClick={currentExerciseIndex < content.exercises.length - 1 ? nextExercise : onComplete}
              colorScheme="blue"
              size="lg"
            >
              {currentExerciseIndex < content.exercises.length - 1 ? 'Next Phrase' : 'Complete Lesson'}
            </Button>
          </Center>
        )}
        {feedback && feedback.startsWith('Excellent') && currentExerciseIndex === content.exercises.length - 1 && nextLessonId && onNavigateToNextLesson && (
          <Center mt={4}>
            <Button
              rightIcon={<FaArrowRight />}
              onClick={handleNextLesson}
              colorScheme="green"
              variant="outline"
              size="lg"
            >
              Next Lesson
            </Button>
          </Center>
        )}
      </VStack>
    </Container>
  );
}

export default Lesson;
