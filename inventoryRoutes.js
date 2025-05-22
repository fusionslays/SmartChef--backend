const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all inventory items
router.get('/', inventoryController.getInventoryItems);

// Get expiring items
router.get('/expiring', inventoryController.getExpiringItems);

// Get a single inventory item
router.get('/:id', inventoryController.getInventoryItem);

// Create a new inventory item
router.post('/', inventoryController.createInventoryItem);

// Update an inventory item
router.put('/:id', inventoryController.updateInventoryItem);

// Delete an inventory item
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;
