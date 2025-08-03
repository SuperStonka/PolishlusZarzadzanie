const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const costTypes = await db.query('SELECT * FROM typy_kosztow ORDER BY nazwa ASC');
    res.json(costTypes.rows);
  } catch (error) {
    console.error('Get cost types error:', error);
    res.status(500).json({ error: 'Failed to get cost types' });
  }
});

module.exports = router; 