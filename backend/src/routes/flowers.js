const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

// Get all flowers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const flowers = await db.query('SELECT * FROM kwiaty WHERE aktywny = true ORDER BY nazwa ASC');
    res.json(flowers.rows);
  } catch (error) {
    console.error('Get flowers error:', error);
    res.status(500).json({ error: 'Failed to get flowers' });
  }
});

// Get flower by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const flower = await db.query('SELECT * FROM kwiaty WHERE id = $1 AND aktywny = true', [id]);
    
    if (flower.rows.length === 0) {
      return res.status(404).json({ error: 'Flower not found' });
    }
    
    res.json(flower.rows[0]);
  } catch (error) {
    console.error('Get flower error:', error);
    res.status(500).json({ error: 'Failed to get flower' });
  }
});

// Create new flower
router.post('/', authenticateToken, isUser, async (req, res) => {
  try {
    const { nazwa, kolor, cena, dostawca_id } = req.body;
    const newFlower = await db.query(
      'INSERT INTO kwiaty (nazwa, kolor, cena, dostawca_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nazwa, kolor, cena, dostawca_id]
    );
    
    res.status(201).json({
      message: 'Flower created successfully',
      flower: newFlower.rows[0]
    });
  } catch (error) {
    console.error('Create flower error:', error);
    res.status(500).json({ error: 'Failed to create flower' });
  }
});

// Update flower
router.put('/:id', authenticateToken, isUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { nazwa, kolor, cena, dostawca_id } = req.body;
    
    const updatedFlower = await db.query(
      'UPDATE kwiaty SET nazwa = $1, kolor = $2, cena = $3, dostawca_id = $4 WHERE id = $5 RETURNING *',
      [nazwa, kolor, cena, dostawca_id, id]
    );
    
    if (updatedFlower.rows.length === 0) {
      return res.status(404).json({ error: 'Flower not found' });
    }
    
    res.json({
      message: 'Flower updated successfully',
      flower: updatedFlower.rows[0]
    });
  } catch (error) {
    console.error('Update flower error:', error);
    res.status(500).json({ error: 'Failed to update flower' });
  }
});

// Delete flower
router.delete('/:id', authenticateToken, isUser, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('UPDATE kwiaty SET aktywny = false WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flower not found' });
    }
    
    res.json({ message: 'Flower deleted successfully' });
  } catch (error) {
    console.error('Delete flower error:', error);
    res.status(500).json({ error: 'Failed to delete flower' });
  }
});

module.exports = router; 