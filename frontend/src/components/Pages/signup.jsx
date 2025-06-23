// signup.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)',
      [email, username, hashedPassword]
    );
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ error: 'User already exists or DB error' });
  }
});

module.exports = router;
