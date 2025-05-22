const InventoryItem = require('../models/InventoryItem');

// Get all inventory items for a user
exports.getInventoryItems = async (req, res) => {
  try {
    const inventoryItems = await InventoryItem.find({ user: req.user._id });
    res.json(inventoryItems);
  } catch (error) {
    console.error('Error in getInventoryItems:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single inventory item
exports.getInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json(inventoryItem);
  } catch (error) {
    console.error('Error in getInventoryItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const { name, category, quantity, expirationDate } = req.body;
    
    const inventoryItem = await InventoryItem.create({
      user: req.user._id,
      name,
      category,
      quantity,
      expirationDate
    });
    
    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error('Error in createInventoryItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { name, category, quantity, expirationDate } = req.body;
    
    const inventoryItem = await InventoryItem.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    inventoryItem.name = name || inventoryItem.name;
    inventoryItem.category = category || inventoryItem.category;
    inventoryItem.quantity = quantity || inventoryItem.quantity;
    inventoryItem.expirationDate = expirationDate || inventoryItem.expirationDate;
    
    const updatedItem = await inventoryItem.save();
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error in updateInventoryItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    await inventoryItem.remove();
    
    res.json({ message: 'Inventory item removed' });
  } catch (error) {
    console.error('Error in deleteInventoryItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get expiring items
exports.getExpiringItems = async (req, res) => {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    const expiringItems = await InventoryItem.find({
      user: req.user._id,
      expirationDate: { $gte: today, $lte: threeDaysFromNow }
    }).sort({ expirationDate: 1 });
    
    res.json(expiringItems);
  } catch (error) {
    console.error('Error in getExpiringItems:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
