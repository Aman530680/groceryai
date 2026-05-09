const router = require('express').Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, seedProducts,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/seed', protect, adminOnly, seedProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
