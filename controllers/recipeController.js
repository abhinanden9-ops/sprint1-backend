const db = require('../db');

const getAllRecipes = async (req, res) => {
  const userId = req.user.id;
  const { search, category } = req.query;

  try {
    let query = 'SELECT * FROM recipes WHERE user_id = $1';
    const params = [userId];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND title ILIKE $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve recipes.' });
  }
};

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

    const ingredientsResult = await db.query(
      'SELECT * FROM ingredients WHERE recipe_id = $1',
      [recipeId]
    );

    const recipe = recipeResult.rows[0];
    recipe.ingredients = ingredientsResult.rows;

    return res.status(200).json(recipe);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve recipe.' });
  }
};

const createRecipe = async (req, res) => {
  const userId = req.user.id;
  const { title, description, instructions, prep_time, servings, category, image_url, ingredients } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Recipe title is required.' });
  }

  try {
    const recipeResult = await db.query(
      `INSERT INTO recipes (user_id, title, description, instructions, prep_time, servings, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, description, instructions, prep_time, servings, category, image_url]
    );

    const recipe = recipeResult.rows[0];

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
    return res.status(500).json({ error: 'Failed to create recipe.' });
  }
};

const updateRecipe = async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;
  const { title, description, instructions, prep_time, servings, category, image_url } = req.body;

  try {
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
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title, description, instructions, prep_time, servings, category, image_url, recipeId, userId]
    );

    return res.status(200).json({ message: 'Recipe updated successfully.', recipe: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update recipe.' });
  }
};

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
    return res.status(500).json({ error: 'Failed to delete recipe.' });
  }
};

module.exports = { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };
