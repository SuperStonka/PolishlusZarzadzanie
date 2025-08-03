const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM eventy WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM eventy WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (numer ILIKE $${paramIndex} OR nazwa ILIKE $${paramIndex} OR lokalizacja ILIKE $${paramIndex})`;
      countQuery += ` AND (numer ILIKE $${paramIndex} OR nazwa ILIKE $${paramIndex} OR lokalizacja ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY data DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const [events, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      events: events.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get event by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await db.query(
      'SELECT * FROM eventy WHERE id = $1',
      [id]
    );

    if (event.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event.rows[0]);

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Create new event
router.post('/', authenticateToken, isUser, async (req, res) => {
  try {
    const { numer, nazwa, data, lokalizacja, status = 'planowany', opis } = req.body;

    // Check if event number already exists
    const existingEvent = await db.query(
      'SELECT id FROM eventy WHERE numer = $1',
      [numer]
    );

    if (existingEvent.rows.length > 0) {
      return res.status(400).json({ error: 'Event number already exists' });
    }

    const newEvent = await db.query(
      'INSERT INTO eventy (numer, nazwa, data, lokalizacja, status, opis) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [numer, nazwa, data, lokalizacja, status, opis]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent.rows[0]
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticateToken, isUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { numer, nazwa, data, lokalizacja, status, opis } = req.body;

    // Check if event exists
    const existingEvent = await db.query(
      'SELECT id FROM eventy WHERE id = $1',
      [id]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if new number conflicts with other events
    if (numer) {
      const conflictingEvent = await db.query(
        'SELECT id FROM eventy WHERE numer = $1 AND id != $2',
        [numer, id]
      );

      if (conflictingEvent.rows.length > 0) {
        return res.status(400).json({ error: 'Event number already exists' });
      }
    }

    const updatedEvent = await db.query(
      'UPDATE eventy SET numer = COALESCE($1, numer), nazwa = COALESCE($2, nazwa), data = COALESCE($3, data), lokalizacja = COALESCE($4, lokalizacja), status = COALESCE($5, status), opis = COALESCE($6, opis), updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [numer, nazwa, data, lokalizacja, status, opis, id]
    );

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent.rows[0]
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, isUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM eventy WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get events by date range
router.get('/calendar/:startDate/:endDate', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const events = await db.query(
      'SELECT * FROM eventy WHERE data BETWEEN $1 AND $2 ORDER BY data ASC',
      [startDate, endDate]
    );

    res.json(events.rows);

  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to get calendar events' });
  }
});

// Get event statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM produkty_w_eventach WHERE event_id = $1) as total_products,
        (SELECT COUNT(*) FROM produkty_w_eventach WHERE event_id = $1 AND spakowane > 0) as packed_products,
        (SELECT COUNT(*) FROM kwiaty_w_eventach WHERE event_id = $1) as total_flowers,
        (SELECT COUNT(*) FROM kwiaty_w_eventach WHERE event_id = $1 AND spakowane > 0) as packed_flowers,
        (SELECT COUNT(*) FROM koszty_eventow WHERE event_id = $1) as total_costs,
        (SELECT COALESCE(SUM(wartosc_brutto), 0) FROM koszty_eventow WHERE event_id = $1) as total_cost_value
    `, [id]);

    res.json(stats.rows[0]);

  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({ error: 'Failed to get event statistics' });
  }
});

module.exports = router; 