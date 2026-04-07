import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <span className="text-2xl">🥦</span>
            <span>GroceryAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Shop</Link>
            <Link to="/recipes" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Recipes</Link>
            {user && (
              <>
                <Link to="/meal-planner" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Meal Planner</Link>
                <Link to="/nutrition" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Nutrition</Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 card shadow-lg py-1 animate-fade-in">
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Profile</Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">My Orders</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-600">Admin Panel</Link>
                    )}
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
