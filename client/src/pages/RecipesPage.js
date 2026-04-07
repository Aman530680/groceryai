import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RecipeCard from '../components/ui/RecipeCard';
import Spinner from '../components/ui/Spinner';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => { fetchRecipes(); }, [difficulty]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      const { data } = await api.get('/recipes', { params });
      setRecipes(data.recipes);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🍽️ Recipe Collection</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); fetchRecipes(); }} className="flex gap-2 flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipes..." className="input flex-1" />
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input w-auto">
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🍳</div>
          <p>No recipes found. Try the AI generator on the home page!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}
