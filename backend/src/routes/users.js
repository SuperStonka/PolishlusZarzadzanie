const express = require('express');
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, imie, nazwisko, email, rola, avatar, aktywny, created_at FROM users ORDER BY nazwisko ASC'
    );
    res.json(users.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

module.exports = router; 