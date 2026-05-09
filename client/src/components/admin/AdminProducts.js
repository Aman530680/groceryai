import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['vegetables', 'fruits', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'beverages', 'snacks', 'other'];
const EMPTY = { name: '', description: '', price: '', category: 'vegetables', stock: '', unit: 'piece', image: '', tags: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [seeding, setSeeding] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const loadSampleProducts = async () => {
    if (!window.confirm('Load 24 sample products? This only works if no products exist yet.')) return;
    setSeeding(true);
    try {
      const { data } = await api.post('/products/seed');
      toast.success(data.message);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seed failed');
    } finally { setSeeding(false); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { limit: 200 } });
      setProducts(data.products);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '', price: p.price,
      category: p.category, stock: p.stock, unit: p.unit || 'piece',
      image: p.image || '', tags: (p.tags || []).join(', '),
    });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success('✅ Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('✅ Product added successfully');
      }
      setShowForm(false); setForm(EMPTY); setEditing(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter ? p.category === catFilter : true;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadSampleProducts} disabled={seeding} className="btn-secondary flex items-center gap-2">
            📦 {seeding ? 'Loading...' : 'Load Sample Products'}
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <span className="text-lg">+</span> Add New Product
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">{editing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Fresh Tomatoes" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" placeholder="100" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input">
                {['piece', 'kg', 'g', 'liter', 'ml', 'pack', 'bunch', 'dozen', 'bag', 'box', 'can', 'bottle', 'loaf', 'bar', 'tub', 'block', 'punnet'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" placeholder="https://..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="fresh, organic, healthy" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} placeholder="Product description..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary px-6">
                {submitting ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search products..."
          className="input flex-1"
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input w-auto">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <span className="text-sm text-gray-400 self-center whitespace-nowrap">{filtered.length} results</span>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No products found</td></tr>
              ) : filtered.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🛒</div>}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">{p.category}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-primary-600">${Number(p.price).toFixed(2)}<span className="text-xs text-gray-400 font-normal">/{p.unit}</span></td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-yellow-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-yellow-500">★ {p.rating?.toFixed(1) || '0.0'} <span className="text-gray-400 text-xs">({p.numReviews})</span></td>
                  <td className="px-5 py-4">
                    <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {p.stock === 0 ? 'Out of Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
