const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required.' });
  }
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }
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
    return res.status(500).json({ error: 'Server error during registration.' });
  }
};

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
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = generateToken(user);
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const recipeCount = await db.query(
      'SELECT COUNT(*) FROM recipes WHERE user_id = $1',
      [req.user.id]
    );
    return res.status(200).json({
      ...result.rows[0],
      recipe_count: parseInt(recipeCount.rows[0].count, 10),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
};

const updateProfile = async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = result.rows[0];

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, req.user.id]);
    }

    if (username && username.trim()) {
      await db.query('UPDATE users SET username = $1 WHERE id = $2', [username.trim(), req.user.id]);
    }

    const updated = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    return res.status(200).json(updated.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { register, login, getMe, updateProfile };
