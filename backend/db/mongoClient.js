const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'xxx';

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    const db = client.db(dbName);
    return { db, client };
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}

module.exports = connectDB;
