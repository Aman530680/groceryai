import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        return;
      }
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async () => {
    setLoading(true);
    try {
      const user = await login('aman123@groceryai.com', 'aman123');
      if (user.role !== 'admin') { toast.error('Access denied.'); return; }
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-purple-100 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
            ⚙️
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Restricted access — Admins only</p>
        </div>

        {/* Quick Login */}
        <button
          type="button"
          onClick={quickLogin}
          disabled={loading}
          className="w-full flex items-center justify-between bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔑</span>
            <div className="text-left">
              <p className="text-sm font-bold">Quick Admin Login</p>
              <p className="text-xs opacity-70">aman123@groceryai.com</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-purple-200 dark:bg-purple-800 px-3 py-1 rounded-lg">
            {loading ? '...' : 'Login →'}
          </span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">or enter credentials</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading ? 'Signing in...' : '🔐 Access Admin Panel'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Not an admin?{' '}
          <a href="/" className="text-purple-600 hover:underline">Go to Store</a>
        </p>
      </div>
    </div>
  );
}
