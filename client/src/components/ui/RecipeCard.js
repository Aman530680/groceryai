import React from 'react';

export default function RecipeCard({ recipe, onAddMissing }) {
  const missingCount = recipe.missingIngredients?.length || 0;
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const diffStyle = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 card-glow">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-300">🍽️</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`badge text-xs ${diffStyle[recipe.difficulty] || diffStyle.easy} backdrop-blur-sm`}>
            {recipe.difficulty}
          </span>
          {recipe.isAIGenerated && (
            <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 backdrop-blur-sm">🤖 AI</span>
          )}
        </div>

        {/* Time overlay */}
        <div className="absolute bottom-3 right-3">
          <span className="badge bg-black/50 text-white backdrop-blur-sm">⏱ {totalTime} min</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{recipe.title}</h3>
        {recipe.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{recipe.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>👥 {recipe.servings} servings</span>
          {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
          {recipe.ingredients?.length > 0 && <span>🥗 {recipe.ingredients.length} ingredients</span>}
        </div>

        {/* Nutrition */}
        {recipe.nutrition?.calories > 0 && (
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {[
              { label: 'Cal', value: recipe.nutrition.calories, color: 'text-orange-500' },
              { label: 'Protein', value: `${recipe.nutrition.protein}g`, color: 'text-blue-500' },
              { label: 'Carbs', value: `${recipe.nutrition.carbs}g`, color: 'text-yellow-500' },
              { label: 'Fat', value: `${recipe.nutrition.fat}g`, color: 'text-red-400' },
            ].map((n) => (
              <div key={n.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2 text-center">
                <div className={`text-xs font-bold ${n.color}`}>{n.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{n.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Missing ingredients CTA */}
        {missingCount > 0 && onAddMissing && (
          <button
            onClick={() => onAddMissing(recipe.missingIngredients)}
            className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-200 dark:hover:shadow-green-900 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            🛒 Add {missingCount} Missing Item{missingCount > 1 ? 's' : ''} to Cart
          </button>
        )}
      </div>
    </div>
  );
}
