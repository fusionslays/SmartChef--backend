const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Produce', 'Meat', 'Dairy', 'Grains', 'Pantry', 'Frozen', 'Spices', 'Other'],
    default: 'Other'
  },
  quantity: {
    type: String,
    required: true,
    trim: true
  },
  expirationDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries by user
inventoryItemSchema.index({ user: 1 });

// Index for expiration date queries
inventoryItemSchema.index({ expirationDate: 1 });

// Compound index for category filtering by user
inventoryItemSchema.index({ user: 1, category: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
