const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const cars = await db.query('SELECT * FROM samochody WHERE aktywny = true ORDER BY model ASC');
    res.json(cars.rows);
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ error: 'Failed to get cars' });
  }
});

module.exports = router; 