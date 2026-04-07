const MealPlan = require('../models/MealPlan');

exports.getMealPlan = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const query = { user: req.user._id };
    if (weekStart) query.weekStart = new Date(weekStart);

    const plan = await MealPlan.findOne(query)
      .populate('days.monday.breakfast days.monday.lunch days.monday.dinner')
      .populate('days.tuesday.breakfast days.tuesday.lunch days.tuesday.dinner')
      .populate('days.wednesday.breakfast days.wednesday.lunch days.wednesday.dinner')
      .populate('days.thursday.breakfast days.thursday.lunch days.thursday.dinner')
      .populate('days.friday.breakfast days.friday.lunch days.friday.dinner')
      .populate('days.saturday.breakfast days.saturday.lunch days.saturday.dinner')
      .populate('days.sunday.breakfast days.sunday.lunch days.sunday.dinner');

    res.json(plan || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveMealPlan = async (req, res) => {
  try {
    const { weekStart, days } = req.body;
    const plan = await MealPlan.findOneAndUpdate(
      { user: req.user._id, weekStart: new Date(weekStart) },
      { days },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
