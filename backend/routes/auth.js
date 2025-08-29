const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { logInfo, logError } = require('../logger');

const router = express.Router();

const JWT_SECRET = 'dev_secret_key';

// Register
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const db = req.app.locals.db;
    const users = db.collection('users');

    const existing = await users.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({ username, password: hashedPassword, role });

    return res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const db = req.app.locals.db;
    const users = db.collection('users');

    logInfo('Login attempt', {
      username: username,
      service: 'student-marks-api'
    });

    const user = await users.findOne({ username });
    
    if (!user) {
      logInfo('Login failed - user not found', {
        username: username,
        service: 'student-marks-api'
      });
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logInfo('Login failed - invalid password', {
        username: username,
        service: 'student-marks-api'
      });
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    
    logInfo('User logged in successfully', {
      username: username,
      role: user.role,
      service: 'student-marks-api'
    });
    
    res.json({ token });
  } catch (err) {
    logError('Login error', {
      username: username,
      error: err.message,
      service: 'student-marks-api'
    });
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // Get user info from token if needed
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        logInfo('User logged out', {
          username: decoded.username,
          role: decoded.role,
          service: 'student-marks-api'
        });
      } catch (err) {
        // Token is invalid/expired, which is fine for logout
        logInfo('Logout with invalid/expired token', {
          service: 'student-marks-api'
        });
      }
    } else {
      logInfo('Logout without token', {
        service: 'student-marks-api'
      });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
