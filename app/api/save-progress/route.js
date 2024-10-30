import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { verifyToken } from '../../lib/auth'; 

/**
 * @dev Handles POST requests to save user progress in a lesson.
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} - The response object.
 */
export async function POST(req) {
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

    // @dev Parse the request body to get progress details
    const { languageCode, lessonId, exerciseIndex, completed } = await req.json();

    // @dev Connect to the database
    const { db } = await connectToDatabase();
    const userProgress = db.collection('userProgress');

    // @dev Update the user's progress in the database
    const result = await userProgress.updateOne(
      { userId, languageCode, lessonId },
      { 
        $set: { 
          exerciseIndex,
          completed: completed ? true : '$completed' // Only update to true if completed is true
        }
      },
      { upsert: true }
    );

    // @dev Return the result of the update operation
    return NextResponse.json({ success: true, result });
  } catch (error) {
    // @dev Log any errors that occur during the progress saving process and return a 500 error
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}