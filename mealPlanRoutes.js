const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all meal plans
router.get('/', mealPlanController.getMealPlans);

// Get meal plan by date
router.get('/date/:date', mealPlanController.getMealPlanByDate);

// Create or update a meal plan
router.post('/', mealPlanController.createOrUpdateMealPlan);

// Add a meal to a meal plan
router.post('/:mealPlanId/meals', mealPlanController.addMealToMealPlan);

// Update a meal in a meal plan
router.put('/:mealPlanId/meals/:mealId', mealPlanController.updateMealInMealPlan);

// Remove a meal from a meal plan
router.delete('/:mealPlanId/meals/:mealId', mealPlanController.removeMealFromMealPlan);

// Delete a meal plan
router.delete('/:mealPlanId', mealPlanController.deleteMealPlan);

module.exports = router;
