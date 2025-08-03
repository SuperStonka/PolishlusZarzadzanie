const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const rentals = await db.query('SELECT * FROM wypozyczalnie ORDER BY nazwa ASC');
    res.json(rentals.rows);
  } catch (error) {
    console.error('Get rentals error:', error);
    res.status(500).json({ error: 'Failed to get rentals' });
  }
});

module.exports = router; 