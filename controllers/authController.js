const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Helper — generates a signed JWT for the given user payload
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
// Creates a new user account with a bcrypt-hashed password
const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required.' });
  }

  try {
    // Prevent duplicate accounts
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // Hash password — never store plain text
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password_hash]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    return res.status(201).json({ message: 'User registered successfully.', token, user: newUser });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
};

// POST /api/auth/login
// Validates credentials and returns a JWT token
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Compare submitted password against the stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    // Return user data without exposing the password hash
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

module.exports = { register, login };
