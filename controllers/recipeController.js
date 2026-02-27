const db = require('../db');

// GET /api/recipes
// Returns all recipes for the authenticated user, with optional search and category filters
const getAllRecipes = async (req, res) => {
  const userId = req.user.id;
  const { search, category } = req.query;

  try {
    let query = 'SELECT * FROM recipes WHERE user_id = $1';
    const params = [userId];

    // Append title search filter if provided (case-insensitive)
    if (search) {
      params.push(`%${search}%`);
      query += ` AND title ILIKE $${params.length}`;
    }

    // Append category filter if provided
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('getAllRecipes error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve recipes.' });
  }
};

// GET /api/recipes/:id
// Returns a single recipe with all its ingredients
const getRecipeById = async (req, res) => {
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

    // Fetch associated ingredients in the same response
    const ingredientsResult = await db.query(
      'SELECT * FROM ingredients WHERE recipe_id = $1',
      [recipeId]
    );

    const recipe = recipeResult.rows[0];
    recipe.ingredients = ingredientsResult.rows;

    return res.status(200).json(recipe);
  } catch (err) {
    console.error('getRecipeById error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve recipe.' });
  }
};

// POST /api/recipes
// Creates a new recipe and optionally inserts ingredients in the same request
const createRecipe = async (req, res) => {
  const userId = req.user.id;
  const { title, description, instructions, prep_time, servings, category, image_url, ingredients } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Recipe title is required.' });
  }

  try {
    // Insert the recipe row
    const recipeResult = await db.query(
      `INSERT INTO recipes (user_id, title, description, instructions, prep_time, servings, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, description, instructions, prep_time, servings, category, image_url]
    );

    const recipe = recipeResult.rows[0];

    // Insert each ingredient tied to this recipe
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
    console.error('createRecipe error:', err.message);
    return res.status(500).json({ error: 'Failed to create recipe.' });
  }
};

// PUT /api/recipes/:id
// Updates an existing recipe — only the owner can make changes
const updateRecipe = async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;
  const { title, description, instructions, prep_time, servings, category, image_url } = req.body;

  try {
    // Confirm ownership before updating
    const existing = await db.query(
      'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
      [recipeId, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found or access denied.' });
    }

    // COALESCE keeps current value if new value is not provided
    const result = await db.query(
      `UPDATE recipes
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           instructions = COALESCE($3, instructions),
           prep_time = COALESCE($4, prep_time),
           servings = COALESCE($5, servings),
           category = COALESCE($6, category),
           image_url = COALESCE($7, image_url)
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title, description, instructions, prep_time, servings, category, image_url, recipeId, userId]
    );

    return res.status(200).json({ message: 'Recipe updated successfully.', recipe: result.rows[0] });
  } catch (err) {
    console.error('updateRecipe error:', err.message);
    return res.status(500).json({ error: 'Failed to update recipe.' });
  }
};

// DELETE /api/recipes/:id
// Deletes a recipe — cascades to delete all its ingredients via FK constraint
const deleteRecipe = async (req, res) => {
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
    console.error('deleteRecipe error:', err.message);
    return res.status(500).json({ error: 'Failed to delete recipe.' });
  }
};

module.exports = { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };
