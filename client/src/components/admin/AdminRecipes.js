import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', description: '', cuisine: '', difficulty: 'easy',
  cookTime: 30, prepTime: 15, servings: 2, tags: '', image: '',
  ingredients: [{ name: '', quantity: '', unit: '' }],
  steps: [''],
  nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
};

const DIFF_STYLE = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [search, setSearch] = useState('');
  const [seeding, setSeeding] = useState(false);

  const loadSamples = async () => {
    if (!window.confirm('Add 5 sample recipes to the database?')) return;
    setSeeding(true);
    try {
      const { data } = await api.post('/recipes/seed');
      toast.success(data.message);
      fetchRecipes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed recipes');
    } finally { setSeeding(false); }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/recipes', { params: { limit: 100 } });
      setRecipes(data.recipes);
    } catch { toast.error('Failed to load recipes'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      title: r.title || '',
      description: r.description || '',
      cuisine: r.cuisine || '',
      difficulty: r.difficulty || 'easy',
      cookTime: r.cookTime || 30,
      prepTime: r.prepTime || 15,
      servings: r.servings || 2,
      tags: (r.tags || []).join(', '),
      image: r.image || '',
      ingredients: r.ingredients?.length
        ? r.ingredients.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit || '' }))
        : [{ name: '', quantity: '', unit: '' }],
      steps: r.steps?.length ? r.steps : [''],
      nutrition: r.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    });
    setImagePreview(r.image || '');
    setEditing(r._id);
    setShowForm(true);
  };

  // Image URL preview handler
  const handleImageUrl = (url) => {
    setForm((prev) => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  // Ingredients handlers
  const addIngredient = () =>
    setForm((prev) => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }] }));

  const removeIngredient = (i) =>
    setForm((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, idx) => idx !== i) }));

  const updateIngredient = (i, field, value) =>
    setForm((prev) => {
      const updated = [...prev.ingredients];
      updated[i] = { ...updated[i], [field]: value };
      return { ...prev, ingredients: updated };
    });

  // Steps handlers
  const addStep = () => setForm((prev) => ({ ...prev, steps: [...prev.steps, ''] }));
  const removeStep = (i) => setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, idx) => idx !== i) }));
  const updateStep = (i, value) =>
    setForm((prev) => {
      const updated = [...prev.steps];
      updated[i] = value;
      return { ...prev, steps: updated };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        ingredients: form.ingredients.filter((i) => i.name.trim()),
        steps: form.steps.filter((s) => s.trim()),
      };
      if (editing) {
        await api.put(`/recipes/${editing}`, payload);
        toast.success('✅ Recipe updated!');
      } else {
        await api.post('/recipes', payload);
        toast.success('✅ Recipe added!');
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditing(null);
      setImagePreview('');
      fetchRecipes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save recipe');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/recipes/${id}`);
      toast.success('Recipe deleted');
      fetchRecipes();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.cuisine || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Recipes</h1>
          <p className="text-sm text-gray-500">{recipes.length} total recipes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSamples} disabled={seeding} className="btn-secondary flex items-center gap-2">
            {seeding ? '⏳ Loading...' : '📦 Load Sample Recipes'}
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <span className="text-lg">+</span> Add New Recipe
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search recipes by title or cuisine..."
          className="input"
        />
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing ? '✏️ Edit Recipe' : '➕ Add New Recipe'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-6">

            {/* ── BASIC INFO ── */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-1">Recipe Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="e.g. Chicken Tikka Masala" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cuisine</label>
                  <input value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} className="input" placeholder="e.g. Indian, Italian" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                  <input type="number" min="0" value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: Number(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cook Time (min)</label>
                  <input type="number" min="0" value={form.cookTime} onChange={(e) => setForm({ ...form, cookTime: Number(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Servings</label>
                  <input type="number" min="1" value={form.servings} onChange={(e) => setForm({ ...form, servings: Number(e.target.value) })} className="input" />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="healthy, quick, vegan, breakfast" />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} placeholder="Brief description of the recipe..." />
                </div>
              </div>
            </div>

            {/* ── IMAGE ── */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recipe Image</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">🌐 Paste Image URL (from internet)</label>
                    <input
                      value={form.image}
                      onChange={(e) => handleImageUrl(e.target.value)}
                      className="input"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Tip: Right-click any image online → "Copy image address" → paste here
                    </p>
                  </div>

                  {/* Quick image suggestions */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Quick pick from Unsplash:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '🍝 Pasta', url: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400' },
                        { label: '🍛 Curry', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
                        { label: '🥗 Salad', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
                        { label: '🍳 Eggs', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400' },
                        { label: '🍲 Soup', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
                        { label: '🐟 Fish', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
                        { label: '🥘 Stew', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
                        { label: '🥞 Pancake', url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400' },
                      ].map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => handleImageUrl(img.url)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-all ${form.image === img.url ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary-400'}`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-medium text-gray-500 mb-2 self-start">Preview:</p>
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview('')}
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-xs">Image preview will appear here</p>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <button type="button" onClick={() => { setImagePreview(''); setForm((p) => ({ ...p, image: '' })); }}
                      className="text-xs text-red-500 hover:text-red-700 mt-2">
                      ✕ Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── INGREDIENTS ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ingredients</h3>
                <button type="button" onClick={addIngredient} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-100 font-medium">
                  + Add Ingredient
                </button>
              </div>
              <div className="space-y-2">
                {form.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1}.</span>
                    <input
                      value={ing.name}
                      onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="input flex-1"
                    />
                    <input
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="input w-20"
                    />
                    <input
                      value={ing.unit}
                      onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                      placeholder="Unit"
                      className="input w-20"
                    />
                    {form.ingredients.length > 1 && (
                      <button type="button" onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600 text-lg shrink-0">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── STEPS ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cooking Steps</h3>
                <button type="button" onClick={addStep} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-100 font-medium">
                  + Add Step
                </button>
              </div>
              <div className="space-y-2">
                {form.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-2">{i + 1}</div>
                    <textarea
                      value={step}
                      onChange={(e) => updateStep(i, e.target.value)}
                      placeholder={`Step ${i + 1} description...`}
                      className="input flex-1 resize-none"
                      rows={2}
                    />
                    {form.steps.length > 1 && (
                      <button type="button" onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 text-lg mt-2 shrink-0">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── NUTRITION ── */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Nutrition (per serving)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: 'calories', label: 'Calories', unit: 'kcal' },
                  { key: 'protein', label: 'Protein', unit: 'g' },
                  { key: 'carbs', label: 'Carbs', unit: 'g' },
                  { key: 'fat', label: 'Fat', unit: 'g' },
                  { key: 'fiber', label: 'Fiber', unit: 'g' },
                ].map(({ key, label, unit }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1 text-gray-500">{label} ({unit})</label>
                    <input
                      type="number"
                      min="0"
                      value={form.nutrition[key]}
                      onChange={(e) => setForm({ ...form, nutrition: { ...form.nutrition, [key]: Number(e.target.value) } })}
                      className="input text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button type="submit" disabled={submitting} className="btn-primary px-8">
                {submitting ? 'Saving...' : editing ? '✅ Update Recipe' : '✅ Add Recipe'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Recipes Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-gray-500 mb-4">No recipes yet</p>
          <button onClick={openAdd} className="btn-primary">Add Your First Recipe</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div key={r._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="h-44 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 relative overflow-hidden">
                {r.image ? (
                  <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`badge text-xs ${DIFF_STYLE[r.difficulty]}`}>{r.difficulty}</span>
                  {r.isAIGenerated && <span className="badge bg-purple-100 text-purple-700 text-xs">🤖 AI</span>}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white truncate">{r.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{r.cuisine || 'International'}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>⏱ {(r.prepTime || 0) + (r.cookTime || 0)} min</span>
                  <span>👥 {r.servings} servings</span>
                  <span>🥗 {r.ingredients?.length || 0} ingredients</span>
                </div>

                {/* Nutrition mini */}
                {r.nutrition?.calories > 0 && (
                  <div className="flex gap-2 mt-2">
                    {[
                      { label: 'Cal', value: r.nutrition.calories },
                      { label: 'P', value: `${r.nutrition.protein}g` },
                      { label: 'C', value: `${r.nutrition.carbs}g` },
                      { label: 'F', value: `${r.nutrition.fat}g` },
                    ].map((n) => (
                      <div key={n.label} className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-1 text-center">
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{n.value}</div>
                        <div className="text-xs text-gray-400">{n.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(r)} className="flex-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-medium transition-colors">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(r._id, r.title)} className="flex-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 py-2 rounded-lg hover:bg-red-100 font-medium transition-colors">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
