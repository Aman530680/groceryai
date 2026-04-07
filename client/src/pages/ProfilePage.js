import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    preferences: {
      diet: user?.preferences?.diet || 'none',
      allergies: user?.preferences?.allergies?.join(', ') || '',
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', {
        name: form.name,
        preferences: {
          diet: form.preferences.diet,
          allergies: form.preferences.allergies.split(',').map((a) => a.trim()).filter(Boolean),
        },
      });
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">👤 My Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Diet Preference</label>
            <select
              value={form.preferences.diet}
              onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, diet: e.target.value } })}
              className="input"
            >
              {['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten-free'].map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Allergies (comma-separated)</label>
            <input
              value={form.preferences.allergies}
              onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, allergies: e.target.value } })}
              placeholder="nuts, dairy, gluten..."
              className="input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
