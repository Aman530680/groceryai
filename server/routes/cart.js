const router = require('express').Router();
const {
  getCart, addToCart, addMissingIngredients, updateCartItem, clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.post('/add-missing', addMissingIngredients);
router.put('/:productId', updateCartItem);
router.delete('/clear', clearCart);

module.exports = router;
