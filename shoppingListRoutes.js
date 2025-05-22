const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all shopping lists
router.get('/', shoppingListController.getShoppingLists);

// Get a single shopping list
router.get('/:id', shoppingListController.getShoppingList);

// Create a new shopping list
router.post('/', shoppingListController.createShoppingList);

// Generate shopping list from meal plan
router.post('/generate-from-meal-plan', shoppingListController.generateFromMealPlan);

// Update a shopping list
router.put('/:id', shoppingListController.updateShoppingList);

// Delete a shopping list
router.delete('/:id', shoppingListController.deleteShoppingList);

// Add item to shopping list
router.post('/:id/items', shoppingListController.addItemToShoppingList);

// Update item in shopping list
router.put('/:id/items/:itemId', shoppingListController.updateItemInShoppingList);

// Remove item from shopping list
router.delete('/:id/items/:itemId', shoppingListController.removeItemFromShoppingList);

// Clear checked items
router.put('/:id/clear-checked', shoppingListController.clearCheckedItems);

module.exports = router;
