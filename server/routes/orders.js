const router = require('express').Router();
const {
  createOrder, confirmPayment, getMyOrders, getOrder, cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.put('/:id/pay', confirmPayment);
router.put('/:id/cancel', cancelOrder);
router.get('/:id', getOrder);

module.exports = router;
