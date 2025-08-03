const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const statusUpdates = await db.query(`
      SELECT a.*, e.numer as event_numer, e.nazwa as event_nazwa 
      FROM aktualizacje_statusu a 
      LEFT JOIN eventy e ON a.event_id = e.id 
      ORDER BY a.data_aktualizacji DESC 
      LIMIT 20
    `);
    res.json(statusUpdates.rows);
  } catch (error) {
    console.error('Get status updates error:', error);
    res.status(500).json({ error: 'Failed to get status updates' });
  }
});

module.exports = router; 