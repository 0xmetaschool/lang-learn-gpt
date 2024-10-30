import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { verifyToken } from '../../lib/auth'; 

/**
 * @dev Handles GET requests to fetch user progress for a specific language.
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} - The response object containing user progress.
 */
export async function GET(req) {
  // @dev Get the token from the Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  try {
    // @dev Verify the token and get the user ID
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // @dev Extract the languageCode from the query parameters
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('languageCode');

    // @dev Connect to the database
    const { db } = await connectToDatabase();
    const userProgress = db.collection('userProgress');

    // @dev Fetch the user's progress for the specified language
    const progress = await userProgress.find({ userId, languageCode }).toArray();

    // @dev Map the progress data to a more usable format
    const progressMap = progress.reduce((acc, item) => {
      acc[item.lessonId] = {
        exerciseIndex: item.exerciseIndex,
        completed: item.completed,
      };
      return acc;
    }, {});

    // @dev Return the progress map
    return NextResponse.json(progressMap);
  } catch (error) {
    // @dev Log any errors that occur during the progress fetching process and return a 500 error
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ error: 'Failed to fetch user progress' }, { status: 500 });
  }
}