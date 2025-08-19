const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // default local URI
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('school'); // use your DB name
    const students = db.collection('students');

    // Sample insert
    const result = await students.insertOne({
      name: 'Test Student',
      age: 20,
      marks: { math: 80, physics: 75 }
    });

    console.log('📦 Inserted ID:', result.insertedId);

    // Sample find
    const data = await students.find().toArray();
    console.log('📋 All Students:', data);

  } catch (err) {
    console.error('❌ MongoDB error:', err);
  } finally {
    await client.close();
  }
}

run();
