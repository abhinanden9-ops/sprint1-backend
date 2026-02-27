const db = require('../db');

// GET /api/ingredients/recipe/:recipeId
// Returns all ingredients for a recipe — verifies the user owns the recipe first
const getIngredientsByRecipe = async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.params;

  try {
    // Ownership check — user can only access their own recipe's ingredients
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
    console.error('getIngredientsByRecipe error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve ingredients.' });
  }
};

// POST /api/ingredients
// Adds a single ingredient to a recipe
const addIngredient = async (req, res) => {
  const userId = req.user.id;
  const { recipe_id, name, quantity, unit } = req.body;

  if (!recipe_id || !name) {
    return res.status(400).json({ error: 'recipe_id and name are required.' });
  }

  try {
    // Verify ownership before inserting
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
    console.error('addIngredient error:', err.message);
    return res.status(500).json({ error: 'Failed to add ingredient.' });
  }
};

// PUT /api/ingredients/:id
// Updates a specific ingredient — user must own the parent recipe
const updateIngredient = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, quantity, unit } = req.body;

  try {
    // Join ingredients to recipes to verify ownership
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
       WHERE id = $4 RETURNING *`,
      [name, quantity, unit, id]
    );

    return res.status(200).json({ message: 'Ingredient updated.', ingredient: result.rows[0] });
  } catch (err) {
    console.error('updateIngredient error:', err.message);
    return res.status(500).json({ error: 'Failed to update ingredient.' });
  }
};

// DELETE /api/ingredients/:id
// Removes a specific ingredient — user must own the parent recipe
const deleteIngredient = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Join to verify ownership before deletion
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
    console.error('deleteIngredient error:', err.message);
    return res.status(500).json({ error: 'Failed to delete ingredient.' });
  }
};

module.exports = { getIngredientsByRecipe, addIngredient, updateIngredient, deleteIngredient };
