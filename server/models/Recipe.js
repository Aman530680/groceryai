const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    ingredients: [
      {
        name: { type: String, required: true },
        quantity: { type: String, default: '' },
        unit: { type: String, default: '' },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
      },
    ],
    steps: [{ type: String }],
    cookTime: { type: Number, default: 30 },
    prepTime: { type: Number, default: 15 },
    servings: { type: Number, default: 2 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    cuisine: { type: String, default: 'International' },
    tags: [{ type: String }],
    image: { type: String, default: '' },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
    },
    isAIGenerated: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

recipeSchema.index({ title: 'text', tags: 'text', cuisine: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
