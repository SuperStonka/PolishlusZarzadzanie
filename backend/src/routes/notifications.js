const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.query(
      'SELECT * FROM powiadomienia WHERE uzytkownik_id = $1 ORDER BY data_powiadomienia DESC LIMIT 20',
      [req.user.id]
    );
    res.json(notifications.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

module.exports = router; 