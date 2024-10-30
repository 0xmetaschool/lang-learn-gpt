import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { generateToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

/**
 * @dev Handles the POST request for user login.
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object containing the token and user details if login is successful, or an error message if not.
 */
export async function POST(req) {
  try {
    // @dev Extract email and password from the request body
    const { email, password } = await req.json();

    // @dev Connect to the database
    const { db } = await connectToDatabase();

    // @dev Find the user with the provided email
    const user = await db.collection('users').findOne({ email });

    // @dev If no user is found, return a 404 error
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // @dev Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // @dev If the password is invalid, return a 401 error
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // @dev Generate a token for the authenticated user
    const token = await generateToken(user._id.toString());

    // @dev Log the successful login and send the response with the token and user details
    console.log('Login successful. Sending response:', { token, user: { id: user._id.toString(), email: user.email, name: user.name } });

    return NextResponse.json({ 
      token, 
      user: { id: user._id.toString(), email: user.email } 
    });
  } catch (error) {
    // @dev Log any errors that occur during the login process and return a 500 error
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}