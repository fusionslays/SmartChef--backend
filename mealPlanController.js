const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

// Get all meal plans for a user
exports.getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ user: req.user._id })
      .populate('meals.recipe')
      .sort({ date: 1 });
    
    res.json(mealPlans);
  } catch (error) {
    console.error('Error in getMealPlans:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get meal plan for a specific date
exports.getMealPlanByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Create a date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const mealPlan = await MealPlan.findOne({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('meals.recipe');
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found for this date' });
    }
    
    res.json(mealPlan);
  } catch (error) {
    console.error('Error in getMealPlanByDate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create or update a meal plan
exports.createOrUpdateMealPlan = async (req, res) => {
  try {
    const { day, date, meals } = req.body;
    
    // Validate meals
    if (meals) {
      for (const meal of meals) {
        if (meal.recipe) {
          const recipe = await Recipe.findById(meal.recipe);
          if (!recipe) {
            return res.status(400).json({ message: `Recipe with ID ${meal.recipe} not found` });
          }
        }
      }
    }
    
    // Create a date object from the string
    const mealPlanDate = new Date(date);
    
    // Check if meal plan already exists for this date
    let mealPlan = await MealPlan.findOne({
      user: req.user._id,
      date: {
        $gte: new Date(mealPlanDate.setHours(0, 0, 0, 0)),
        $lte: new Date(mealPlanDate.setHours(23, 59, 59, 999))
      }
    });
    
    if (mealPlan) {
      // Update existing meal plan
      mealPlan.day = day || mealPlan.day;
      mealPlan.date = date ? new Date(date) : mealPlan.date;
      
      if (meals) {
        mealPlan.meals = meals;
      }
      
      const updatedMealPlan = await mealPlan.save();
      await updatedMealPlan.populate('meals.recipe');
      
      res.json(updatedMealPlan);
    } else {
      // Create new meal plan
      mealPlan = await MealPlan.create({
        user: req.user._id,
        day,
        date: new Date(date),
        meals: meals || []
      });
      
      await mealPlan.populate('meals.recipe');
      
      res.status(201).json(mealPlan);
    }
  } catch (error) {
    console.error('Error in createOrUpdateMealPlan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a meal to a meal plan
exports.addMealToMealPlan = async (req, res) => {
  try {
    const { mealPlanId } = req.params;
    const { type, recipe, notes } = req.body;
    
    // Validate recipe
    if (recipe) {
      const recipeExists = await Recipe.findById(recipe);
      if (!recipeExists) {
        return res.status(400).json({ message: `Recipe with ID ${recipe} not found` });
      }
    }
    
    const mealPlan = await MealPlan.findOne({
      _id: mealPlanId,
      user: req.user._id
    });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Add the meal
    mealPlan.meals.push({
      type,
      recipe,
      notes
    });
    
    const updatedMealPlan = await mealPlan.save();
    await updatedMealPlan.populate('meals.recipe');
    
    res.json(updatedMealPlan);
  } catch (error) {
    console.error('Error in addMealToMealPlan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a meal in a meal plan
exports.updateMealInMealPlan = async (req, res) => {
  try {
    const { mealPlanId, mealId } = req.params;
    const { type, recipe, notes } = req.body;
    
    // Validate recipe
    if (recipe) {
      const recipeExists = await Recipe.findById(recipe);
      if (!recipeExists) {
        return res.status(400).json({ message: `Recipe with ID ${recipe} not found` });
      }
    }
    
    const mealPlan = await MealPlan.findOne({
      _id: mealPlanId,
      user: req.user._id
    });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Find the meal
    const mealIndex = mealPlan.meals.findIndex(meal => meal._id.toString() === mealId);
    
    if (mealIndex === -1) {
      return res.status(404).json({ message: 'Meal not found in this meal plan' });
    }
    
    // Update the meal
    if (type) mealPlan.meals[mealIndex].type = type;
    if (recipe !== undefined) mealPlan.meals[mealIndex].recipe = recipe;
    if (notes !== undefined) mealPlan.meals[mealIndex].notes = notes;
    
    const updatedMealPlan = await mealPlan.save();
    await updatedMealPlan.populate('meals.recipe');
    
    res.json(updatedMealPlan);
  } catch (error) {
    console.error('Error in updateMealInMealPlan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove a meal from a meal plan
exports.removeMealFromMealPlan = async (req, res) => {
  try {
    const { mealPlanId, mealId } = req.params;
    
    const mealPlan = await MealPlan.findOne({
      _id: mealPlanId,
      user: req.user._id
    });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Remove the meal
    mealPlan.meals = mealPlan.meals.filter(meal => meal._id.toString() !== mealId);
    
    const updatedMealPlan = await mealPlan.save();
    await updatedMealPlan.populate('meals.recipe');
    
    res.json(updatedMealPlan);
  } catch (error) {
    console.error('Error in removeMealFromMealPlan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a meal plan
exports.deleteMealPlan = async (req, res) => {
  try {
    const { mealPlanId } = req.params;
    
    const mealPlan = await MealPlan.findOne({
      _id: mealPlanId,
      user: req.user._id
    });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    await mealPlan.remove();
    
    res.json({ message: 'Meal plan removed' });
  } catch (error) {
    console.error('Error in deleteMealPlan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
