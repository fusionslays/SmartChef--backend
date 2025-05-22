const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all recipes with filtering
router.get('/', recipeController.getRecipes);

// Get recipe suggestions based on inventory
router.get('/suggestions', recipeController.getRecipeSuggestions);

// Get a single recipe
router.get('/:id', recipeController.getRecipe);

// Create a new recipe
router.post('/', recipeController.createRecipe);

// Update a recipe
router.put('/:id', recipeController.updateRecipe);

// Delete a recipe
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;
