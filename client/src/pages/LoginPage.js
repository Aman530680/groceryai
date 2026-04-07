import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="card p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🥦</div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to GroceryAI</p>
        </div>

        {/* Quick Login Buttons */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 space-y-3">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">⚡ Quick Login:</p>
          <button
            type="button"
            onClick={() => quickLogin('aman123@groceryai.com', 'aman123')}
            disabled={loading}
            className="w-full flex items-center justify-between bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔑</span>
              <div className="text-left">
                <p className="text-xs font-bold">Admin Panel</p>
                <p className="text-xs opacity-70">aman123@groceryai.com</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded-lg">
              {loading ? '...' : 'Login →'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('delivery123@groceryai.com', 'delivery123')}
            disabled={loading}
            className="w-full flex items-center justify-between bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🚚</span>
              <div className="text-left">
                <p className="text-xs font-bold">Delivery Dashboard</p>
                <p className="text-xs opacity-70">delivery123@groceryai.com</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-cyan-200 dark:bg-cyan-800 px-2 py-1 rounded-lg">
              {loading ? '...' : 'Login →'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">or login manually</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
