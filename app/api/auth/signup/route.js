import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { generateToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

/**
 * @dev Handles the POST request for user signup.
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object containing the token and user details if signup is successful, or an error message if not.
 */
export async function POST(req) {
  try {
    // @dev Extract email and password from the request body
    const { email, password } = await req.json();

    // @dev Connect to the database
    const { db } = await connectToDatabase();

    // @dev Check if the email is already in use
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // @dev Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // @dev Insert the new user into the database
    const result = await db.collection('users').insertOne({ email, password: hashedPassword });

    // @dev Create a user object with the inserted ID and email
    const user = { id: result.insertedId.toString(), email };

    // @dev Generate a token for the new user
    const token = await generateToken(user.id);

    // @dev Return the response with the token and user details
    return NextResponse.json({ token, user });
  } catch (error) {
    // @dev Log any errors that occur during the signup process and return a 500 error
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}