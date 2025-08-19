const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// --- CONFIG ---
const uri = 'mongodb://localhost:27017';
const dbName = 'school'; // Change if your DB name is different
const username = 'admin';
const plainPassword = 'admin123';
const role = 'admin';
// -------------

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    // 1. Delete any existing user
    await users.deleteMany({ username });
    console.log(`🗑 Removed old users with username "${username}"`);

    // 2. Hash and insert
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await users.insertOne({ username, password: hashedPassword, role });
    console.log(`✅ Registered new user: ${username} (${role})`);

    // 3. Fetch from DB
    const user = await users.findOne({ username });
    console.log("📦 Stored user:", user);

    // 4. Compare passwords
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log("🔍 bcrypt.compare result:", isMatch);

    if (isMatch) {
      console.log("🎉 Password match confirmed — login should work in GraphQL");
    } else {
      console.log("❌ Password mismatch — hashing or storage issue");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

main();
