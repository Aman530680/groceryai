const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStart: { type: Date, required: true },
    days: {
      monday: {
        breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
      },
      tuesday: {
        breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
      },
      wednesday: {
        breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
      },
      thursday: {
        breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
      },
      friday: {
        breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
      },
      saturday: {
        breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
      },
      sunday: {
        breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
        dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
      },
    },
    totalNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MealPlan', mealPlanSchema);
