const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

class User {
  constructor(db) {
    this.collection = db.collection('users');
  }

  // Create a new user (Admin or Teacher)
  async createUser(username, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.collection.insertOne({ username, password: hashedPassword, role });
  }

  // Find a user by username
  async findByUsername(username) {
    return this.collection.findOne({ username });
  }

  // Verify password during login
  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  }

  // Find user by ID
  async findById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }
}

module.exports = User;
