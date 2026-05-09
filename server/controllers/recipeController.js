const Recipe = require('../models/Recipe');
const Product = require('../models/Product');
const aiService = require('../services/aiService');

exports.getRecipes = async (req, res) => {
  try {
    const { search, cuisine, difficulty, page = 1, limit = 9 } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (cuisine) query.cuisine = cuisine;
    if (difficulty) query.difficulty = difficulty;

    const recipes = await Recipe.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Recipe.countDocuments(query);
    res.json({ recipes, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('ingredients.product');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generateFromIngredients = async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients?.length) {
      return res.status(400).json({ message: 'Ingredients are required' });
    }

    // Save to user history
    if (req.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { ingredientHistory: { $each: ingredients } },
      });
    }

    const aiRecipes = await aiService.generateRecipesFromIngredients(ingredients);

    // Match missing ingredients to products in DB
    const enrichedRecipes = await Promise.all(
      aiRecipes.map(async (recipe) => {
        const enrichedIngredients = await Promise.all(
          recipe.ingredients.map(async (ing) => {
            const product = await Product.findOne({
              name: { $regex: ing.name, $options: 'i' },
              isActive: true,
            });
            return { ...ing, product: product || null };
          })
        );
        return { ...recipe, ingredients: enrichedIngredients, isAIGenerated: true };
      })
    );

    res.json({ recipes: enrichedRecipes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.seedRecipes = async (req, res) => {
  try {
    const samples = [
      {
        title: 'Veg Fried Rice',
        description: 'Quick and flavorful fried rice loaded with fresh vegetables.',
        cuisine: 'Chinese', difficulty: 'easy', prepTime: 15, cookTime: 20, servings: 3,
        tags: ['rice', 'vegetables', 'quick', 'asian'],
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
        ingredients: [
          { name: 'Cooked Rice', quantity: '3', unit: 'cups' },
          { name: 'Carrot', quantity: '1', unit: 'piece' },
          { name: 'Capsicum', quantity: '1', unit: 'piece' },
          { name: 'Soy Sauce', quantity: '2', unit: 'tbsp' },
          { name: 'Garlic', quantity: '4', unit: 'cloves' },
        ],
        steps: ['Heat oil in a wok.', 'Add garlic and sauté for 1 minute.', 'Add vegetables and stir fry on high flame.', 'Add cooked rice and soy sauce.', 'Mix well and cook for 5 minutes.', 'Serve hot.'],
        nutrition: { calories: 280, protein: 7, carbs: 48, fat: 6, fiber: 4 },
      },
      {
        title: 'Paneer Butter Masala',
        description: 'Creamy paneer curry cooked in rich tomato gravy.',
        cuisine: 'Indian', difficulty: 'medium', prepTime: 15, cookTime: 30, servings: 4,
        tags: ['paneer', 'curry', 'indian', 'creamy'],
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
        ingredients: [
          { name: 'Paneer', quantity: '250', unit: 'g' },
          { name: 'Tomato', quantity: '3', unit: 'pieces' },
          { name: 'Butter', quantity: '2', unit: 'tbsp' },
          { name: 'Cream', quantity: '100', unit: 'ml' },
          { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
        ],
        steps: ['Heat butter in a pan.', 'Cook tomatoes until soft.', 'Blend into smooth gravy.', 'Add spices and cream.', 'Add paneer cubes and simmer.', 'Serve with naan.'],
        nutrition: { calories: 390, protein: 18, carbs: 14, fat: 28, fiber: 3 },
      },
      {
        title: 'Chocolate Pancakes',
        description: 'Soft fluffy pancakes with rich chocolate flavor.',
        cuisine: 'American', difficulty: 'easy', prepTime: 10, cookTime: 15, servings: 2,
        tags: ['breakfast', 'sweet', 'chocolate', 'pancakes'],
        image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400',
        ingredients: [
          { name: 'Flour', quantity: '1', unit: 'cup' },
          { name: 'Cocoa Powder', quantity: '2', unit: 'tbsp' },
          { name: 'Milk', quantity: '1', unit: 'cup' },
          { name: 'Egg', quantity: '1', unit: 'piece' },
          { name: 'Sugar', quantity: '2', unit: 'tbsp' },
        ],
        steps: ['Mix all dry ingredients.', 'Add milk and egg.', 'Whisk into smooth batter.', 'Heat pan and pour batter.', 'Cook both sides until fluffy.', 'Serve with syrup.'],
        nutrition: { calories: 350, protein: 8, carbs: 45, fat: 14, fiber: 3 },
      },
      {
        title: 'Margherita Pizza',
        description: 'Classic cheesy pizza with tomato sauce and basil.',
        cuisine: 'Italian', difficulty: 'medium', prepTime: 30, cookTime: 25, servings: 2,
        tags: ['pizza', 'cheese', 'italian', 'baked'],
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        ingredients: [
          { name: 'Pizza Dough', quantity: '1', unit: 'base' },
          { name: 'Mozzarella Cheese', quantity: '200', unit: 'g' },
          { name: 'Tomato Sauce', quantity: '1', unit: 'cup' },
          { name: 'Basil Leaves', quantity: '10', unit: 'pieces' },
        ],
        steps: ['Spread tomato sauce on dough.', 'Add mozzarella cheese.', 'Bake at 220°C for 15 minutes.', 'Garnish with basil leaves.', 'Slice and serve hot.'],
        nutrition: { calories: 500, protein: 20, carbs: 55, fat: 22, fiber: 4 },
      },
      {
        title: 'Butter Chicken',
        description: 'Creamy and mildly spiced chicken curry.',
        cuisine: 'Indian', difficulty: 'medium', prepTime: 20, cookTime: 35, servings: 4,
        tags: ['butter chicken', 'curry', 'spicy', 'indian'],
        image: 'https://images.unsplash.com/photo-1603893662172-99ed0cea2a08?w=400',
        ingredients: [
          { name: 'Chicken', quantity: '500', unit: 'g' },
          { name: 'Butter', quantity: '3', unit: 'tbsp' },
          { name: 'Tomato Puree', quantity: '1', unit: 'cup' },
          { name: 'Cream', quantity: '100', unit: 'ml' },
          { name: 'Ginger Garlic Paste', quantity: '2', unit: 'tbsp' },
        ],
        steps: ['Cook chicken until golden.', 'Prepare tomato gravy.', 'Add butter and cream.', 'Mix chicken into gravy.', 'Simmer for 10 minutes.', 'Serve with naan.'],
        nutrition: { calories: 450, protein: 32, carbs: 12, fat: 30, fiber: 2 },
      },
    ];
    const inserted = await Recipe.insertMany(samples.map((r) => ({ ...r, createdBy: req.user._id })));
    res.json({ message: `✅ ${inserted.length} sample recipes added!`, count: inserted.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
