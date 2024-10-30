import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * @dev Connects to the MongoDB database.
 * @returns {Promise<{db: Db, client: MongoClient}>} - The database and client objects.
 */
export async function connectToDatabase() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'languageLearningApp';
  const db = client.db(dbName);
  return { db, client };
}

export default clientPromise;