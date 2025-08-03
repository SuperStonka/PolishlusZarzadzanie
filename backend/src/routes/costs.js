const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const costs = await db.query(`
      SELECT k.*, tk.nazwa as typ_kosztu_nazwa, e.numer as event_numer 
      FROM koszty_eventow k 
      LEFT JOIN typy_kosztow tk ON k.typ_kosztu_id = tk.id 
      LEFT JOIN eventy e ON k.event_id = e.id 
      ORDER BY k.created_at DESC
    `);
    res.json(costs.rows);
  } catch (error) {
    console.error('Get costs error:', error);
    res.status(500).json({ error: 'Failed to get costs' });
  }
});

module.exports = router; 