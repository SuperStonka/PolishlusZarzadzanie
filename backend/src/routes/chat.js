const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await db.query(`
      SELECT w.*, u.imie, u.nazwisko, u.avatar 
      FROM wiadomosci_chat w 
      LEFT JOIN users u ON w.nadawca_id = u.id 
      ORDER BY w.timestamp DESC 
      LIMIT 50
    `);
    res.json(messages.rows);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to get chat messages' });
  }
});

router.post('/', authenticateToken, isUser, async (req, res) => {
  try {
    const { tresc, odbiorca_id, zdjecia = [] } = req.body;
    const nadawca_id = req.user.id;

    const newMessage = await db.query(
      'INSERT INTO wiadomosci_chat (nadawca_id, odbiorca_id, tresc, zdjecia) VALUES ($1, $2, $3, $4) RETURNING *',
      [nadawca_id, odbiorca_id, tresc, zdjecia]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: newMessage.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router; 