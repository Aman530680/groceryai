import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RecipeCard({ recipe, onAddMissing }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const missingCount = recipe.missingIngredients?.length || 0;

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 flex items-center justify-center text-6xl">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          '🍽️'
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{recipe.title}</h3>
          {recipe.isAIGenerated && (
            <span className="badge bg-purple-100 text-purple-700 shrink-0">🤖 AI</span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{recipe.description}</p>

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>⏱ {recipe.prepTime + recipe.cookTime} min</span>
          <span>👥 {recipe.servings} servings</span>
          <span className={`badge ${
            recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>{recipe.difficulty}</span>
        </div>

        {recipe.nutrition && (
          <div className="grid grid-cols-4 gap-1 mt-3 text-center">
            {[
              { label: 'Cal', value: recipe.nutrition.calories },
              { label: 'Protein', value: `${recipe.nutrition.protein}g` },
              { label: 'Carbs', value: `${recipe.nutrition.carbs}g` },
              { label: 'Fat', value: `${recipe.nutrition.fat}g` },
            ].map((n) => (
              <div key={n.label} className="bg-gray-50 dark:bg-gray-700 rounded p-1">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{n.value}</div>
                <div className="text-xs text-gray-400">{n.label}</div>
              </div>
            ))}
          </div>
        )}

        {missingCount > 0 && onAddMissing && (
          <button
            onClick={() => onAddMissing(recipe.missingIngredients)}
            className="mt-3 w-full btn-primary text-sm py-2"
          >
            🛒 Add {missingCount} Missing Item{missingCount > 1 ? 's' : ''} to Cart
          </button>
        )}
      </div>
    </div>
  );
}
