import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DeliveryLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (!['delivery', 'admin'].includes(user.role)) {
        toast.error('Access denied. Delivery staff only.');
        return;
      }
      toast.success(`Welcome, ${user.name}!`);
      navigate('/delivery');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async () => {
    setLoading(true);
    try {
      const user = await login('delivery123@groceryai.com', 'delivery123');
      if (!['delivery', 'admin'].includes(user.role)) { toast.error('Access denied.'); return; }
      toast.success(`Welcome, ${user.name}!`);
      navigate('/delivery');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-cyan-100 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
            🚚
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Delivery Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Restricted access — Delivery staff only</p>
        </div>

        {/* Quick Login */}
        <button
          type="button"
          onClick={quickLogin}
          disabled={loading}
          className="w-full flex items-center justify-between bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-700 text-cyan-800 dark:text-cyan-300 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🚚</span>
            <div className="text-left">
              <p className="text-sm font-bold">Quick Delivery Login</p>
              <p className="text-xs opacity-70">delivery123@groceryai.com</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-cyan-200 dark:bg-cyan-800 px-3 py-1 rounded-lg">
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
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="delivery@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading ? 'Signing in...' : '🚚 Access Delivery Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Not delivery staff?{' '}
          <a href="/" className="text-cyan-600 hover:underline">Go to Store</a>
        </p>
      </div>
    </div>
  );
}
