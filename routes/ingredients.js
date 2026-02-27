const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// All ingredient routes are protected
router.use(verifyToken);

// GET /api/ingredients/recipe/:recipeId
// Returns all ingredients for a specific recipe (user must own the recipe)
router.get('/recipe/:recipeId', async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.params;

  try {
    // Verify user owns the recipe before returning ingredients
    const ownerCheck = await db.query(
      'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
      [recipeId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found or access denied.' });
    }

    const result = await db.query(
      'SELECT * FROM ingredients WHERE recipe_id = $1',
      [recipeId]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('GET /ingredients/recipe/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve ingredients.' });
  }
});

// POST /api/ingredients
// Adds a single ingredient to a recipe
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { recipe_id, name, quantity, unit } = req.body;

  if (!recipe_id || !name) {
    return res.status(400).json({ error: 'recipe_id and name are required.' });
  }

  try {
    // Verify user owns the recipe before adding ingredient
    const ownerCheck = await db.query(
      'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
      [recipe_id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found or access denied.' });
    }

    const result = await db.query(
      'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *',
      [recipe_id, name, quantity, unit]
    );

    return res.status(201).json({ message: 'Ingredient added.', ingredient: result.rows[0] });
  } catch (err) {
    console.error('POST /ingredients error:', err.message);
    return res.status(500).json({ error: 'Failed to add ingredient.' });
  }
});

// PUT /api/ingredients/:id
// Updates a specific ingredient (user must own the parent recipe)
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, quantity, unit } = req.body;

  try {
    // Join to verify ownership through the recipe
    const ownerCheck = await db.query(
      `SELECT i.id FROM ingredients i
       JOIN recipes r ON i.recipe_id = r.id
       WHERE i.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found or access denied.' });
    }

    const result = await db.query(
      `UPDATE ingredients
       SET name = COALESCE($1, name),
           quantity = COALESCE($2, quantity),
           unit = COALESCE($3, unit)
       WHERE id = $4
       RETURNING *`,
      [name, quantity, unit, id]
    );

    return res.status(200).json({ message: 'Ingredient updated.', ingredient: result.rows[0] });
  } catch (err) {
    console.error('PUT /ingredients/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to update ingredient.' });
  }
});

// DELETE /api/ingredients/:id
// Deletes a specific ingredient (user must own the parent recipe)
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Join to verify ownership through the recipe
    const ownerCheck = await db.query(
      `SELECT i.id FROM ingredients i
       JOIN recipes r ON i.recipe_id = r.id
       WHERE i.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found or access denied.' });
    }

    await db.query('DELETE FROM ingredients WHERE id = $1', [id]);

    return res.status(200).json({ message: 'Ingredient deleted.' });
  } catch (err) {
    console.error('DELETE /ingredients/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to delete ingredient.' });
  }
});

module.exports = router;
