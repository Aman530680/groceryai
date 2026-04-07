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

exports.deleteRecipe = async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
