const mongoose = require('mongoose');

const shoppingListItemSchema = new mongoose.Schema({
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
  checked: {
    type: Boolean,
    default: false
  }
});

const shoppingListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'My Shopping List',
    trim: true
  },
  items: [shoppingListItemSchema],
  // If this list was generated from a meal plan
  generatedFrom: {
    mealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealPlan'
    },
    startDate: Date,
    endDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
shoppingListSchema.index({ user: 1 });
shoppingListSchema.index({ 'generatedFrom.mealPlan': 1 });

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

module.exports = ShoppingList;
