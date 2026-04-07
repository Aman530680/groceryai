const router = require('express').Router();
const { getMyDeliveries, updateDeliveryStatus } = require('../controllers/deliveryController');
const { protect, deliveryOnly } = require('../middleware/auth');

router.use(protect, deliveryOnly);
router.get('/my-deliveries', getMyDeliveries);
router.put('/:id/status', updateDeliveryStatus);

module.exports = router;
