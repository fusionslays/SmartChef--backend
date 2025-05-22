const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  prepTime: {
    type: Number,
    required: true,
    min: 0
  },
  cookTime: {
    type: Number,
    required: true,
    min: 0
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: [{
    type: String,
    required: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  // For user-created recipes
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Flag to distinguish between system recipes and user recipes
  isSystemRecipe: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
recipeSchema.index({ title: 'text', tags: 'text', ingredients: 'text' });
recipeSchema.index({ user: 1 });
recipeSchema.index({ isSystemRecipe: 1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ tags: 1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
