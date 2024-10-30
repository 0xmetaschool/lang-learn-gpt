import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * @dev Verifies a JWT token and returns the user ID if valid.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<string|null>} - The user ID if the token is valid, otherwise null.
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * @dev Generates a JWT token for a given user ID.
 * @param {string} userId - The user ID to include in the token.
 * @returns {Promise<string>} - The generated JWT token.
 */
export async function generateToken(userId) {
  const jwt = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(JWT_SECRET);
  return jwt;
}