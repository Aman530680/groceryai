const router = require('express').Router();
const {
  getDashboard, getAllOrders, updateOrderStatus, assignDelivery,
  getAllUsers, updateUserRole, deleteUser, getDeliveryAgents,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/assign', assignDelivery);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/delivery-agents', getDeliveryAgents);

module.exports = router;
