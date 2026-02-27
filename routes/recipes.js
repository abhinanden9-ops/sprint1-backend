const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// All recipe routes are protected — user must be authenticated
router.use(verifyToken);

// GET /api/recipes
// Returns all recipes belonging to the logged-in user
// Supports optional ?search= and ?category= query params
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const { search, category } = req.query;

  try {
    let query = 'SELECT * FROM recipes WHERE user_id = $1';
    const params = [userId];

    // Add search filter if provided
    if (search) {
      params.push(`%${search}%`);
      query += ` AND title ILIKE $${params.length}`;
    }

    // Add category filter if provided
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('GET /recipes error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve recipes.' });
  }
});

// GET /api/recipes/:id
// Returns a single recipe with its ingredients
router.get('/:id', async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;

  try {
    const recipeResult = await db.query(
      'SELECT * FROM recipes WHERE id = $1 AND user_id = $2',
      [recipeId, userId]
    );

    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    // Fetch associated ingredients
    const ingredientsResult = await db.query(
      'SELECT * FROM ingredients WHERE recipe_id = $1',
      [recipeId]
    );

    const recipe = recipeResult.rows[0];
    recipe.ingredients = ingredientsResult.rows;

    return res.status(200).json(recipe);
  } catch (err) {
    console.error('GET /recipes/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve recipe.' });
  }
});

// POST /api/recipes
// Creates a new recipe and optionally its ingredients in one request
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { title, description, instructions, prep_time, servings, category, image_url, ingredients } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Recipe title is required.' });
  }

  try {
    // Insert the recipe first
    const recipeResult = await db.query(
      `INSERT INTO recipes (user_id, title, description, instructions, prep_time, servings, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, title, description, instructions, prep_time, servings, category, image_url]
    );

    const recipe = recipeResult.rows[0];

    // Insert ingredients if provided
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      const insertedIngredients = [];

      for (const ing of ingredients) {
        const ingResult = await db.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *',
          [recipe.id, ing.name, ing.quantity, ing.unit]
        );
        insertedIngredients.push(ingResult.rows[0]);
      }

      recipe.ingredients = insertedIngredients;
    } else {
      recipe.ingredients = [];
    }

    return res.status(201).json({ message: 'Recipe created successfully.', recipe });
  } catch (err) {
    console.error('POST /recipes error:', err.message);
    return res.status(500).json({ error: 'Failed to create recipe.' });
  }
});

// PUT /api/recipes/:id
// Updates an existing recipe (only owner can update)
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;
  const { title, description, instructions, prep_time, servings, category, image_url } = req.body;

  try {
    // Verify ownership before updating
    const existing = await db.query(
      'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
      [recipeId, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found or access denied.' });
    }

    const result = await db.query(
      `UPDATE recipes
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           instructions = COALESCE($3, instructions),
           prep_time = COALESCE($4, prep_time),
           servings = COALESCE($5, servings),
           category = COALESCE($6, category),
           image_url = COALESCE($7, image_url)
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [title, description, instructions, prep_time, servings, category, image_url, recipeId, userId]
    );

    return res.status(200).json({ message: 'Recipe updated successfully.', recipe: result.rows[0] });
  } catch (err) {
    console.error('PUT /recipes/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to update recipe.' });
  }
});

// DELETE /api/recipes/:id
// Deletes a recipe and all its ingredients (via CASCADE on the DB)
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;

  try {
    const result = await db.query(
      'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING id',
      [recipeId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found or access denied.' });
    }

    return res.status(200).json({ message: 'Recipe deleted successfully.' });
  } catch (err) {
    console.error('DELETE /recipes/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to delete recipe.' });
  }
});

module.exports = router;
