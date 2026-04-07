const router = require('express').Router();
const {
  getRecipes, getRecipe, generateFromIngredients, createRecipe, updateRecipe, deleteRecipe,
} = require('../controllers/recipeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getRecipes);
router.post('/generate', protect, generateFromIngredients);
router.get('/:id', getRecipe);
router.post('/', protect, adminOnly, createRecipe);
router.put('/:id', protect, adminOnly, updateRecipe);
router.delete('/:id', protect, adminOnly, deleteRecipe);

module.exports = router;
