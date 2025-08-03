const express = require('express');
const db = require('../config/database');
const { authenticateToken, isUser } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, kp.nazwa as kategoria_nazwa 
      FROM produkty p 
      LEFT JOIN kategorie_produktow kp ON p.kategoria_id = kp.id 
      WHERE p.aktywny = true
    `;
    let countQuery = 'SELECT COUNT(*) FROM produkty WHERE aktywny = true';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (p.kod ILIKE $${paramIndex} OR p.nazwa ILIKE $${paramIndex})`;
      countQuery += ` AND (kod ILIKE $${paramIndex} OR nazwa ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND p.kategoria_id = $${paramIndex}`;
      countQuery += ` AND kategoria_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ` ORDER BY p.nazwa ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const [products, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      products: products.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.query(`
      SELECT p.*, kp.nazwa as kategoria_nazwa 
      FROM produkty p 
      LEFT JOIN kategorie_produktow kp ON p.kategoria_id = kp.id 
      WHERE p.id = $1 AND p.aktywny = true
    `, [id]);

    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product.rows[0]);

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Create new product
router.post('/', authenticateToken, isUser, async (req, res) => {
  try {
    const { kod, nazwa, kategoria_id, opis, cena, jednostka = 'szt.' } = req.body;

    // Check if product code already exists
    const existingProduct = await db.query(
      'SELECT id FROM produkty WHERE kod = $1',
      [kod]
    );

    if (existingProduct.rows.length > 0) {
      return res.status(400).json({ error: 'Product code already exists' });
    }

    const newProduct = await db.query(
      'INSERT INTO produkty (kod, nazwa, kategoria_id, opis, cena, jednostka) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [kod, nazwa, kategoria_id, opis, cena, jednostka]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct.rows[0]
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateToken, isUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { kod, nazwa, kategoria_id, opis, cena, jednostka } = req.body;

    // Check if product exists
    const existingProduct = await db.query(
      'SELECT id FROM produkty WHERE id = $1',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if new code conflicts with other products
    if (kod) {
      const conflictingProduct = await db.query(
        'SELECT id FROM produkty WHERE kod = $1 AND id != $2',
        [kod, id]
      );

      if (conflictingProduct.rows.length > 0) {
        return res.status(400).json({ error: 'Product code already exists' });
      }
    }

    const updatedProduct = await db.query(
      'UPDATE produkty SET kod = COALESCE($1, kod), nazwa = COALESCE($2, nazwa), kategoria_id = COALESCE($3, kategoria_id), opis = COALESCE($4, opis), cena = COALESCE($5, cena), jednostka = COALESCE($6, jednostka) WHERE id = $7 RETURNING *',
      [kod, nazwa, kategoria_id, opis, cena, jednostka, id]
    );

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct.rows[0]
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (soft delete)
router.delete('/:id', authenticateToken, isUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE produkty SET aktywny = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get product categories
router.get('/categories/list', authenticateToken, async (req, res) => {
  try {
    const categories = await db.query(
      'SELECT * FROM kategorie_produktow ORDER BY nazwa ASC'
    );

    res.json(categories.rows);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

module.exports = router; 