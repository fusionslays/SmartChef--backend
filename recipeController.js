const Recipe = require('../models/Recipe');

// Get all recipes (with filtering options)
exports.getRecipes = async (req, res) => {
  try {
    const { 
      search, 
      tags, 
      difficulty, 
      maxPrepTime, 
      maxCookTime,
      includeUserRecipes = true,
      includeSystemRecipes = true
    } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by user's recipes and/or system recipes
    if (includeUserRecipes && !includeSystemRecipes) {
      query.user = req.user._id;
    } else if (!includeUserRecipes && includeSystemRecipes) {
      query.isSystemRecipe = true;
    } else {
      // Include both user and system recipes
      query.$or = [
        { user: req.user._id },
        { isSystemRecipe: true }
      ];
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Filter by prep time
    if (maxPrepTime) {
      query.prepTime = { $lte: parseInt(maxPrepTime) };
    }
    
    // Filter by cook time
    if (maxCookTime) {
      query.cookTime = { $lte: parseInt(maxCookTime) };
    }
    
    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    
    res.json(recipes);
  } catch (error) {
    console.error('Error in getRecipes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single recipe
exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user has access to this recipe
    if (!recipe.isSystemRecipe && recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this recipe' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error in getRecipe:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    const { 
      title, 
      image, 
      prepTime, 
      cookTime, 
      servings, 
      difficulty,
      ingredients,
      instructions,
      tags
    } = req.body;
    
    const recipe = await Recipe.create({
      title,
      image,
      prepTime,
      cookTime,
      servings,
      difficulty,
      ingredients,
      instructions,
      tags,
      user: req.user._id,
      isSystemRecipe: false
    });
    
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error in createRecipe:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a recipe
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user owns this recipe
    if (recipe.isSystemRecipe || recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }
    
    const { 
      title, 
      image, 
      prepTime, 
      cookTime, 
      servings, 
      difficulty,
      ingredients,
      instructions,
      tags
    } = req.body;
    
    recipe.title = title || recipe.title;
    recipe.image = image || recipe.image;
    recipe.prepTime = prepTime || recipe.prepTime;
    recipe.cookTime = cookTime || recipe.cookTime;
    recipe.servings = servings || recipe.servings;
    recipe.difficulty = difficulty || recipe.difficulty;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.instructions = instructions || recipe.instructions;
    recipe.tags = tags || recipe.tags;
    
    const updatedRecipe = await recipe.save();
    
    res.json(updatedRecipe);
  } catch (error) {
    console.error('Error in updateRecipe:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user owns this recipe
    if (recipe.isSystemRecipe || recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }
    
    await recipe.remove();
    
    res.json({ message: 'Recipe removed' });
  } catch (error) {
    console.error('Error in deleteRecipe:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recipe suggestions based on inventory
exports.getRecipeSuggestions = async (req, res) => {
  try {
    // This would be a more complex algorithm in production
    // For MVP, we'll do a simple matching of ingredients
    
    // Get user's inventory
    const InventoryItem = require('../models/InventoryItem');
    const inventory = await InventoryItem.find({ user: req.user._id });
    
    // Extract ingredient names from inventory
    const userIngredients = inventory.map(item => item.name.toLowerCase());
    
    // Find recipes that match user's ingredients
    const recipes = await Recipe.find({
      $or: [
        { isSystemRecipe: true },
        { user: req.user._id }
      ]
    });
    
    // Score recipes based on how many ingredients the user has
    const scoredRecipes = recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ingredient => {
        // Extract the main ingredient name (before the first comma or quantity)
        const mainIngredient = ingredient.split(',')[0].trim().toLowerCase();
        return mainIngredient;
      });
      
      // Count how many ingredients the user has
      let matchCount = 0;
      recipeIngredients.forEach(ingredient => {
        if (userIngredients.some(userIngredient => 
          ingredient.includes(userIngredient) || userIngredient.includes(ingredient)
        )) {
          matchCount++;
        }
      });
      
      // Calculate match percentage
      const matchPercentage = (matchCount / recipeIngredients.length) * 100;
      
      return {
        ...recipe.toObject(),
        matchPercentage,
        missingIngredientsCount: recipeIngredients.length - matchCount
      };
    });
    
    // Sort by match percentage (highest first)
    scoredRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    res.json(scoredRecipes);
  } catch (error) {
    console.error('Error in getRecipeSuggestions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
