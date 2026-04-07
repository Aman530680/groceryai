import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import RecipeCard from '../components/ui/RecipeCard';
import toast from 'react-hot-toast';

const FLOATING_ITEMS = ['🥦', '🍅', '🥕', '🧅', '🍋', '🥑', '🌽', '🍇', '🥝', '🫐'];

const FEATURES = [
  { icon: '🤖', title: 'AI Recipe Generation', desc: 'Get personalized recipes from your available ingredients instantly.', color: 'from-purple-500 to-indigo-600' },
  { icon: '🛒', title: 'Smart Cart', desc: 'Missing ingredients auto-added to cart with one click.', color: 'from-green-500 to-emerald-600' },
  { icon: '📊', title: 'Nutrition Tracking', desc: 'Track calories, protein, carbs and fat for every meal.', color: 'from-blue-500 to-cyan-600' },
  { icon: '📅', title: 'Meal Planning', desc: 'Plan your entire week with AI-suggested balanced meals.', color: 'from-orange-500 to-amber-600' },
  { icon: '💬', title: 'AI Chatbot', desc: 'Ask cooking questions and get instant expert answers 24/7.', color: 'from-pink-500 to-rose-600' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Fresh groceries delivered to your door same day.', color: 'from-teal-500 to-green-600' },
];

const STATS = [
  { value: '10K+', label: 'Happy Customers', icon: '👥' },
  { value: '500+', label: 'Recipes', icon: '🍽️' },
  { value: '50+', label: 'Fresh Products', icon: '🥦' },
  { value: '4.9★', label: 'App Rating', icon: '⭐' },
];

export default function HomePage() {
  const [ingredients, setIngredients] = useState('');
  const [ingredientList, setIngredientList] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleStats, setVisibleStats] = useState(false);
  const { user } = useAuth();
  const { addMissingIngredients } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setVisibleStats(true), 600);
    return () => clearTimeout(timer);
  }, []);

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
      toast.success(`🎉 Found ${data.recipes.length} recipes!`);
      setTimeout(() => {
        document.getElementById('recipes-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate recipes');
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) { toast.error('Voice not supported in this browser'); return; }
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (e) => {
      const words = e.results[0][0].transcript.split(/,|\s+and\s+/i).map((w) => w.trim()).filter(Boolean);
      setIngredientList((prev) => [...new Set([...prev, ...words])]);
      toast.success('🎤 Ingredients added from voice!');
    };
    recognition.start();
    toast('🎤 Listening...', { icon: '🎤' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { navigate('/login'); return; }
    const formData = new FormData();
    formData.append('image', file);
    const toastId = toast.loading('📷 Analyzing image...');
    try {
      const { data } = await api.post('/upload/analyze-ingredients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIngredientList((prev) => [...new Set([...prev, ...data.ingredients])]);
      toast.success(`✅ Detected ${data.ingredients.length} ingredients!`, { id: toastId });
    } catch {
      toast.error('Image analysis failed', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO SECTION ── */}
      <section className="relative animated-gradient text-white overflow-hidden min-h-[92vh] flex items-center">

        {/* Floating food particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {FLOATING_ITEMS.map((item, i) => (
            <div
              key={i}
              className="absolute text-3xl opacity-20 select-none"
              style={{
                left: `${(i * 11) % 95}%`,
                top: `${(i * 17 + 10) % 85}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 3)}s`,
                animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
              }}
            >
              {item}
            </div>
          ))}
          {/* Glowing orbs */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 rounded-full px-4 py-2 text-sm font-medium mb-6 animate-fade-in-down">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping-slow" />
            AI-Powered Grocery Shopping
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in-up">
            Cook Smarter
            <br />
            <span className="text-yellow-300 drop-shadow-lg">with AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Enter your ingredients → Get AI recipes → Auto-add missing items to cart
          </p>

          {/* ── Ingredient Input Box ── */}
          <div className="glass rounded-3xl p-6 max-w-2xl mx-auto animate-fade-in-up delay-300 shadow-2xl">
            {/* Input row */}
            <div className="flex gap-2 mb-4">
              <input
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Type an ingredient... (e.g. tomato, rice, eggs)"
                className="flex-1 bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <button
                onClick={addIngredient}
                className="bg-white text-green-700 font-bold px-5 py-3 rounded-xl hover:bg-green-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
              >
                Add
              </button>
            </div>

            {/* Voice + Image buttons */}
            <div className="flex gap-2 mb-4 flex-wrap justify-center">
              <button
                onClick={startVoiceInput}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
              >
                🎤 Voice Input
              </button>
              <label className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer">
                📷 Scan Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {/* Ingredient tags */}
            {ingredientList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {ingredientList.map((item, i) => (
                  <span
                    key={item}
                    className="ingredient-tag"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {item}
                    <button
                      onClick={() => removeIngredient(item)}
                      className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center hover:bg-red-400/50 transition-colors text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={generateRecipes}
              disabled={loading || !ingredientList.length}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-black py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-xl hover:shadow-yellow-400/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Recipes...
                </span>
              ) : (
                '✨ Generate AI Recipes'
              )}
            </button>

            {!user && (
              <p className="text-white/60 text-xs mt-3 text-center">
                <Link to="/login" className="underline hover:text-white">Login</Link> to generate recipes
              </p>
            )}
          </div>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-4 mt-8 animate-fade-in-up delay-500">
            <Link to="/products" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105">
              🛒 Shop Now
            </Link>
            <Link to="/recipes" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105">
              🍽️ Browse Recipes
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" className="fill-gray-50 dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-5xl mx-auto px-4 -mt-2 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`stat-card animate-fade-in-up ${visibleStats ? 'opacity-100' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black gradient-text">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI GENERATED RECIPES ── */}
      {recipes.length > 0 && (
        <section id="recipes-section" className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl">🤖</div>
            <div>
              <h2 className="text-2xl font-bold">AI-Generated Recipes</h2>
              <p className="text-gray-500 text-sm">Based on your ingredients</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <RecipeCard
                  recipe={recipe}
                  onAddMissing={recipe.missingIngredients?.length ? addMissingIngredients : null}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            ✨ Why Choose Us
          </div>
          <h2 className="section-title mb-3">Everything You Need</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            From AI-powered recipes to doorstep delivery — we've got your kitchen covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="feature-card group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`feature-icon w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400">Get from ingredients to dinner in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🥦', title: 'Add Ingredients', desc: 'Type, speak, or scan what you have' },
              { step: '02', icon: '🤖', title: 'AI Generates', desc: 'Get personalized recipe suggestions' },
              { step: '03', icon: '🛒', title: 'Auto Cart', desc: 'Missing items added automatically' },
              { step: '04', icon: '🚚', title: 'Fast Delivery', desc: 'Fresh groceries at your door' },
            ].map((s, i) => (
              <div key={s.step} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center text-3xl mx-auto border border-gray-100 dark:border-gray-700">
                    {s.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute mt-8 text-gray-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section className="relative animated-gradient text-white py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-20 text-5xl opacity-10 animate-float">🥦</div>
            <div className="absolute bottom-10 right-20 text-5xl opacity-10 animate-float-slow">🍅</div>
            <div className="absolute top-1/2 left-10 text-4xl opacity-10 animate-float delay-300">🥕</div>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-4xl font-black mb-4 animate-fade-in-up">Ready to Cook Smarter?</h2>
            <p className="text-green-100 text-lg mb-8 animate-fade-in-up delay-200">
              Join thousands of users who shop and cook with AI assistance every day.
            </p>
            <div className="flex items-center justify-center gap-4 animate-fade-in-up delay-300">
              <Link
                to="/register"
                className="bg-white text-green-700 font-black px-8 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 hover:scale-105 shadow-xl text-lg"
              >
                Get Started Free 🚀
              </Link>
              <Link
                to="/products"
                className="border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Browse Shop
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
