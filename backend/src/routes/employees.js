const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

// Get positions
router.get('/stanowiska', async (req, res) => {
  try {
    const positions = await db.query('SELECT * FROM stanowiska ORDER BY nazwa ASC');
    res.json(positions.rows);
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ error: 'Failed to get positions' });
  }
});

router.get('/', async (req, res) => {
  try {
    const employees = await db.query(`
      SELECT p.*, s.nazwa as stanowisko_nazwa 
      FROM pracownicy p 
      LEFT JOIN stanowiska s ON p.stanowisko_id = s.id 
      WHERE p.aktywny = true 
      ORDER BY p.nazwisko ASC
    `);
    res.json(employees.rows);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to get employees' });
  }
});

module.exports = router; 