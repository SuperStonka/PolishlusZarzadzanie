const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const containers = await db.query('SELECT * FROM pojemniki WHERE aktywny = true ORDER BY nazwa ASC');
    res.json(containers.rows);
  } catch (error) {
    console.error('Get containers error:', error);
    res.status(500).json({ error: 'Failed to get containers' });
  }
});

module.exports = router; 