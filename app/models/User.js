import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../lib/mongodb';

/**
 * @dev Finds a user by their email.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<object|null>} - The user object if found, otherwise null.
 */
export async function findUserByEmail(email) {
  const { db } = await connectToDatabase();
  const collection = db.collection('users');
  return collection.findOne({ email });
}

/**
 * @dev Creates a new user.
 * @param {object} userData - The data for the new user.
 * @returns {Promise<object>} - The newly created user object.
 */
export async function createUser(userData) {
  const { db } = await connectToDatabase();
  const collection = db.collection('users');
  const result = await collection.insertOne(userData);
  return { ...userData, _id: result.insertedId };
}

/**
 * @dev Finds a user by their ID.
 * @param {string} id - The ID of the user to find.
 * @returns {Promise<object|null>} - The user object if found, otherwise null.
 */
export async function findUserById(id) {
  const { db } = await connectToDatabase();
  const collection = db.collection('users');
  return collection.findOne({ _id: new ObjectId(id) });
}