import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import RecipeCard from '../components/ui/RecipeCard';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [ingredients, setIngredients] = useState('');
  const [ingredientList, setIngredientList] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const { user } = useAuth();
  const { addMissingIngredients } = useCart();
  const navigate = useNavigate();

  const addIngredient = () => {
    const trimmed = ingredients.trim();
    if (trimmed && !ingredientList.includes(trimmed)) {
      setIngredientList([...ingredientList, trimmed]);
      setIngredients('');
    }
  };

  const removeIngredient = (item) => setIngredientList(ingredientList.filter((i) => i !== item));

  const generateRecipes = async () => {
    if (!user) { navigate('/login'); return; }
    if (!ingredientList.length) { toast.error('Add at least one ingredient'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/recipes/generate', { ingredients: ingredientList });
      setRecipes(data.recipes);
      toast.success(`Found ${data.recipes.length} recipes!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { navigate('/login'); return; }
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/upload/analyze-ingredients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIngredientList((prev) => [...new Set([...prev, ...data.ingredients])]);
      toast.success(`Detected ${data.ingredients.length} ingredients!`);
    } catch {
      toast.error('Image analysis failed');
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) { toast.error('Voice not supported'); return; }
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (e) => {
      const words = e.results[0][0].transcript.split(/,|\s+and\s+/i).map((w) => w.trim()).filter(Boolean);
      setIngredientList((prev) => [...new Set([...prev, ...words])]);
      toast.success('Ingredients added from voice!');
    };
    recognition.start();
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cook Smarter with <span className="text-yellow-300">AI</span>
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Enter your ingredients, get AI-powered recipes, and auto-add missing items to your cart.
          </p>

          {/* Ingredient Input */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex gap-2 mb-4">
              <input
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Type an ingredient (e.g. tomato, rice...)"
                className="input flex-1 bg-white/20 border-white/30 text-white placeholder-white/60"
              />
              <button onClick={addIngredient} className="bg-white text-primary-600 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                Add
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-4 flex-wrap justify-center">
              <button onClick={startVoiceInput} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
                🎤 Voice Input
              </button>
              <label className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                📷 Upload Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {/* Ingredient tags */}
            {ingredientList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {ingredientList.map((item) => (
                  <span key={item} className="flex items-center gap-1 bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                    {item}
                    <button onClick={() => removeIngredient(item)} className="hover:text-red-300 ml-1">×</button>
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={generateRecipes}
              disabled={loading || !ingredientList.length}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? '🤖 Generating Recipes...' : '✨ Generate AI Recipes'}
            </button>
          </div>
        </div>
      </section>

      {/* Recipes */}
      {recipes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">🍽️ AI-Generated Recipes for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, i) => (
              <RecipeCard
                key={i}
                recipe={recipe}
                onAddMissing={recipe.missingIngredients?.length ? addMissingIngredients : null}
              />
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Why GroceryAI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🤖', title: 'AI Recipe Generation', desc: 'Get personalized recipes based on what you have at home.' },
            { icon: '🛒', title: 'Smart Cart', desc: 'Missing ingredients are automatically added to your cart.' },
            { icon: '📊', title: 'Nutrition Tracking', desc: 'Track calories, protein, carbs and fat for every meal.' },
            { icon: '📅', title: 'Meal Planning', desc: 'Plan your entire week with AI-suggested meals.' },
            { icon: '💬', title: 'AI Chatbot', desc: 'Ask cooking questions and get instant expert answers.' },
            { icon: '🚚', title: 'Fast Delivery', desc: 'Fresh groceries delivered to your door.' },
          ].map((f) => (
            <div key={f.title} className="card p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-primary-600 text-white py-16 px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to cook smarter?</h2>
          <p className="text-green-100 mb-8">Join thousands of users who shop and cook with AI assistance.</p>
          <Link to="/register" className="bg-white text-primary-600 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors">
            Get Started Free
          </Link>
        </section>
      )}
    </div>
  );
}
