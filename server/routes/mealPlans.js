const router = require('express').Router();
const { getMealPlan, saveMealPlan } = require('../controllers/mealPlanController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMealPlan);
router.post('/', saveMealPlan);

module.exports = router;
