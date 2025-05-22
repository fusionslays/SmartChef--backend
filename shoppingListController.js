const ShoppingList = require('../models/ShoppingList');
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

// Get all shopping lists for a user
exports.getShoppingLists = async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.find({ user: req.user._id })
      .populate('generatedFrom.mealPlan')
      .sort({ createdAt: -1 });
    
    res.json(shoppingLists);
  } catch (error) {
    console.error('Error in getShoppingLists:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single shopping list
exports.getShoppingList = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('generatedFrom.mealPlan');
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    res.json(shoppingList);
  } catch (error) {
    console.error('Error in getShoppingList:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new shopping list
exports.createShoppingList = async (req, res) => {
  try {
    const { name, items, generatedFrom } = req.body;
    
    const shoppingList = await ShoppingList.create({
      user: req.user._id,
      name: name || 'My Shopping List',
      items: items || [],
      generatedFrom
    });
    
    res.status(201).json(shoppingList);
  } catch (error) {
    console.error('Error in createShoppingList:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a shopping list
exports.updateShoppingList = async (req, res) => {
  try {
    const { name, items } = req.body;
    
    const shoppingList = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    if (name) shoppingList.name = name;
    if (items) shoppingList.items = items;
    
    const updatedShoppingList = await shoppingList.save();
    
    res.json(updatedShoppingList);
  } catch (error) {
    console.error('Error in updateShoppingList:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a shopping list
exports.deleteShoppingList = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    await shoppingList.remove();
    
    res.json({ message: 'Shopping list removed' });
  } catch (error) {
    console.error('Error in deleteShoppingList:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add item to shopping list
exports.addItemToShoppingList = async (req, res) => {
  try {
    const { name, category, quantity } = req.body;
    
    const shoppingList = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    shoppingList.items.push({
      name,
      category,
      quantity,
      checked: false
    });
    
    const updatedShoppingList = await shoppingList.save();
    
    res.json(updatedShoppingList);
  } catch (error) {
    console.error('Error in addItemToShoppingList:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update item in shopping list
exports.updateItemInShoppingList = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, category, quantity, checked } = req.body;
    
    const shoppingList = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    const itemIndex = shoppingList.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in this shopping list' });
    }
    
    if (name) shoppingList.items[itemIndex].name = name;
    if (category) shoppingList.items[itemIndex].category = category;
    if (quantity) shoppingList.items[itemIndex].quantity = quantity;
    if (checked !== undefined) shoppingList.items[itemIndex].checked = checked;
    
    const updatedShoppingList = await shoppingList.save();
    
    res.json(updatedShoppingList);
  } catch (error) {
    console.error('Error in updateItemInShoppingList:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from shopping list
exports.removeItemFromShoppingList = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const shoppingList = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    shoppingList.items = shoppingList.items.filter(item => item._id.toString() !== itemId);
    
    const updatedShoppingList = await shoppingList.save();
    
    res.json(updatedShoppingList);
  } catch (error) {
    console.error('Error in removeItemFromShoppingList:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate shopping list from meal plan
exports.generateFromMealPlan = async (req, res) => {
  try {
    const { mealPlanId, startDate, endDate } = req.body;
    
    // Validate meal plan
    const mealPlan = await MealPlan.findOne({
      _id: mealPlanId,
      user: req.user._id
    }).populate('meals.recipe');
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Extract ingredients from recipes in meal plan
    const ingredients = [];
    
    for (const meal of mealPlan.meals) {
      if (meal.recipe) {
        for (const ingredient of meal.recipe.ingredients) {
          // Parse ingredient to extract name, quantity, etc.
          // This is a simplified version - in production, you'd use NLP or a more sophisticated parser
          const parts = ingredient.split(',');
          const name = parts[0].trim();
          
          // Check if ingredient already exists in the list
          const existingIngredient = ingredients.find(item => 
            item.name.toLowerCase() === name.toLowerCase()
          );
          
          if (existingIngredient) {
            // For simplicity, we're just noting that it's needed for multiple recipes
            existingIngredient.quantity += ' (multiple recipes)';
          } else {
            // Determine category based on common ingredients
            let category = 'Other';
            
            if (/meat|chicken|beef|pork|fish|salmon|tuna|shrimp/i.test(name)) {
              category = 'Meat';
            } else if (/milk|cheese|yogurt|cream|butter/i.test(name)) {
              category = 'Dairy';
            } else if (/apple|banana|orange|lettuce|spinach|onion|garlic|pepper|tomato|carrot/i.test(name)) {
              category = 'Produce';
            } else if (/rice|pasta|flour|bread|cereal|oats/i.test(name)) {
              category = 'Grains';
            } else if (/oil|vinegar|sauce|canned|soup|beans/i.test(name)) {
              category = 'Pantry';
            } else if (/frozen/i.test(name)) {
              category = 'Frozen';
            } else if (/salt|pepper|spice|herb|seasoning/i.test(name)) {
              category = 'Spices';
            }
            
            ingredients.push({
              name,
              category,
              quantity: parts.length > 1 ? parts[1].trim() : '1',
              checked: false
            });
          }
        }
      }
    }
    
    // Create shopping list
    const shoppingList = await ShoppingList.create({
      user: req.user._id,
      name: `Shopping List for ${new Date(mealPlan.date).toLocaleDateString()}`,
      items: ingredients,
      generatedFrom: {
        mealPlan: mealPlanId,
        startDate: startDate || mealPlan.date,
        endDate: endDate
      }
    });
    
    res.status(201).json(shoppingList);
  } catch (error) {
    console.error('Error in generateFromMealPlan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear checked items
exports.clearCheckedItems = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    shoppingList.items = shoppingList.items.filter(item => !item.checked);
    
    const updatedShoppingList = await shoppingList.save();
    
    res.json(updatedShoppingList);
  } catch (error) {
    console.error('Error in clearCheckedItems:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
