const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } = require('../controllers/recipeController');

// All recipe routes require a valid JWT
router.use(verifyToken);

router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;
