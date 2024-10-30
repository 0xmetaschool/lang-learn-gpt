import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyToken } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @dev Load the language-codes JSON file
let languageCodes = [];
try {
  const filePath = path.join(process.cwd(), 'language_codes.json');
  const data = fs.readFileSync(filePath, 'utf8');
  languageCodes = JSON.parse(data);
} catch (err) {
  console.error("Error reading language codes file:", err);
}

/**
 * @dev Handles POST requests to generate and save a new lesson.
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} - The response object.
 */
export async function POST(req) {
  try {
    // @dev Extract the token from the Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @dev Parse the request body to get lesson details
    const { language, lessonTitle, curriculumId, lessonId } = await req.json();

    // @dev Connect to the database
    const { db } = await connectToDatabase();

    // @dev Check if the lesson already exists for the specific user, language, curriculum, and lesson ID
    const existingLesson = await db.collection('lessons').findOne({
      userId,
      curriculumId,
      lessonId,
      language
    });

    if (existingLesson) {
      return NextResponse.json(existingLesson);
    }

    // @dev Generate new lesson content using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates interactive language learning content. Respond with valid JSON only, no additional text."
        },
        {
          role: "user",
          content: `Create an interactive lesson for learning ${language} on the topic "${lessonTitle}". All exercises should be "listen and repeat" type. Provide a JSON object with the following structure:
          {
            "introduction": "Brief introduction to the lesson",
            "exercises": [
              {
                "type": "listen_and_repeat",
                "prompt": "Listen and repeat the following phrase",
                "phrase": "Phrase in ${language} along with it's pronunciation in english in brackets",
                "translation": "English translation of the phrase"
              }
            ]
          }
          Provide 5 exercises, all of "listen_and_repeat" type. Each exercise should introduce a new phrase related to the lesson topic. Ensure the phrases progress in complexity throughout the lesson. Respond with the JSON object only, no additional text or formatting.`
        }
      ],
    });

    // @dev Extract and parse the lesson content from the OpenAI response
    const content = response.choices[0].message.content;
    const lessonContent = JSON.parse(content);

    // @dev Generate audio for each exercise
    for (let exercise of lessonContent.exercises) {
      exercise.audio = await generateAudio(exercise.phrase, language);
    }

    // @dev Save the lesson to the database
    const savedLesson = await db.collection('lessons').insertOne({
      userId,
      curriculumId,
      lessonId,
      language,
      title: lessonTitle,
      content: lessonContent,
      createdAt: new Date(),
    });

    // @dev Update user progress
    await db.collection('userProgress').updateOne(
      { userId, [`${language}.curriculumId`]: curriculumId },
      { 
        $set: { 
          [`${language}.lessons.${lessonId}`]: {
            completed: false,
            lastAccessed: new Date()
          }
        }
      },
      { upsert: true }
    );

    // @dev Return the saved lesson details
    return NextResponse.json({
      _id: savedLesson.insertedId,
      userId,
      curriculumId,
      lessonId,
      language,
      title: lessonTitle,
      content: lessonContent,
    });
  } catch (error) {
    // @dev Handle duplicate key error gracefully
    if (error.code === 11000) {
      console.error('Duplicate lesson detected:', error);
      return NextResponse.json({ error: 'Lesson already exists' }, { status: 409 });
    }

    // @dev Log and return the error
    console.error('Error generating lesson content:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate lesson content', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

/**
 * @dev Generates audio for a given text and language.
 * @param {string} text - The text to convert to audio.
 * @param {string} language - The language of the text.
 * @returns {Promise<string>} - The base64 encoded audio data.
 */
async function generateAudio(text, language) {
  try {
    const languageCode = languageCodes.find(
      (entry) => entry.English.toLowerCase() === language.toLowerCase()
    )?.alpha2 || 'en';

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "opus",
      language: languageCode,
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const base64Audio = audioBuffer.toString('base64');
    return `data:audio/opus;base64,${base64Audio}`;
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error('Failed to generate audio');
  }
}