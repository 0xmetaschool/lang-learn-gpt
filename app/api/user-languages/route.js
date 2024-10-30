import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { verifyToken } from '../../lib/auth';
import fs from 'fs';
import path from 'path';

// @dev Load the language-codes JSON file once when the module is loaded
let languageCodes = [];

try {
  const filePath = path.join(process.cwd(), 'language_codes.json');
  const data = fs.readFileSync(filePath, 'utf8');
  languageCodes = JSON.parse(data);
} catch (err) {
  console.error("Error reading language codes file:", err);
}

/**
 * @dev Handles GET requests to fetch user languages.
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} - The response object containing user languages.
 */
export async function GET(req) {
  try {
    // @dev Extract the token from the request headers
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @dev Connect to the database
    const { db } = await connectToDatabase();
    const userProgress = await db.collection('userProgress').findOne({ userId });

    if (!userProgress) {
      return NextResponse.json({ languages: [] });
    }

    // @dev Extract and format the user's languages
    const languages = Object.keys(userProgress)
      .filter(key => key !== 'userId' && key !== '_id')
      .map(languageCode => ({
        code: languageCode.toLowerCase(),
        name: getLanguageName(languageCode),
      }))
      .filter((language, index, self) => 
        index === self.findIndex((t) => t.code === language.code)
      );

    return NextResponse.json({ languages });
  } catch (error) {
    // @dev Log any errors that occur during the language fetching process and return a 500 error
    console.error('Error fetching user languages:', error);
    return NextResponse.json({ error: 'Failed to fetch user languages' }, { status: 500 });
  }
}

/**
 * @dev Retrieves the full name of a language based on its code.
 * @param {string} languageCode - The language code.
 * @returns {string} - The full name of the language.
 */
function getLanguageName(languageCode) {
  const language = languageCodes.find(lang => lang.alpha2.toLowerCase() === languageCode.toLowerCase());
  return language ? language.English : languageCode;
}

/**
 * @dev Handles POST requests to add a new language for the user.
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} - The response object indicating success or failure.
 */
export async function POST(req) {
  try {
    // @dev Extract the token from the request headers
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @dev Parse the request body to get the language name
    const { languageName } = await req.json();
    const language = languageCodes.find(lang => lang.English.toLowerCase() === languageName.toLowerCase());
    
    if (!language) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    const languageCode = language.alpha2.toLowerCase();

    // @dev Connect to the database
    const { db } = await connectToDatabase();
    
    // @dev Update the user's progress with the new language
    await db.collection('userProgress').updateOne(
      { userId },
      { $set: { [`${languageCode}`]: { name: language.English } } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, languageCode, languageName: language.English });
  } catch (error) {
    // @dev Log any errors that occur during the language addition process and return a 500 error
    console.error('Error adding user language:', error);
    return NextResponse.json({ error: 'Failed to add user language' }, { status: 500 });
  }
}