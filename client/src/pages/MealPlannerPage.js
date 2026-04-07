import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

function getMonday(d = new Date()) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function MealPlannerPage() {
  const [recipes, setRecipes] = useState([]);
  const [plan, setPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [weekStart] = useState(getMonday());

  useEffect(() => {
    Promise.all([
      api.get('/recipes', { params: { limit: 50 } }),
      api.get('/meal-plans', { params: { weekStart: weekStart.toISOString() } }),
    ]).then(([recipesRes, planRes]) => {
      setRecipes(recipesRes.data.recipes);
      if (planRes.data?.days) setPlan(planRes.data.days);
    }).finally(() => setLoading(false));
  }, []);

  const setMeal = (day, meal, recipeId) => {
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: recipeId },
    }));
  };

  const savePlan = async () => {
    try {
      await api.post('/meal-plans', { weekStart: weekStart.toISOString(), days: plan });
      toast.success('Meal plan saved!');
    } catch {
      toast.error('Failed to save meal plan');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📅 Weekly Meal Planner</h1>
          <p className="text-gray-500 text-sm mt-1">Week of {weekStart.toLocaleDateString()}</p>
        </div>
        <button onClick={savePlan} className="btn-primary">Save Plan</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-500 w-24">Day</th>
              {MEALS.map((m) => (
                <th key={m} className="text-left p-3 text-sm font-medium text-gray-500 capitalize">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day} className="border-t border-gray-100 dark:border-gray-700">
                <td className="p-3 font-medium capitalize text-sm">{day}</td>
                {MEALS.map((meal) => (
                  <td key={meal} className="p-2">
                    <select
                      value={plan[day]?.[meal] || ''}
                      onChange={(e) => setMeal(day, meal, e.target.value)}
                      className="input text-sm py-1.5"
                    >
                      <option value="">— Select —</option>
                      {recipes.map((r) => (
                        <option key={r._id} value={r._id}>{r.title}</option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
