const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getIngredientsByRecipe, addIngredient, updateIngredient, deleteIngredient } = require('../controllers/ingredientController');

// All ingredient routes require a valid JWT
router.use(verifyToken);

router.get('/recipe/:recipeId', getIngredientsByRecipe);
router.post('/', addIngredient);
router.put('/:id', updateIngredient);
router.delete('/:id', deleteIngredient);

module.exports = router;
