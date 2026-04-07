import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-lg shadow-md">
                🥦
              </div>
              <span className="font-black text-xl text-white">GroceryAI</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              AI-powered grocery shopping and cooking assistant. Cook smarter, eat better.
            </p>
            <div className="flex gap-3">
              {['🐦', '📘', '📸', '▶️'].map((icon, i) => (
                <button key={i} className="w-8 h-8 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center text-sm transition-all duration-200 hover:scale-110">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'Shop',
              links: [
                { to: '/products', label: 'All Products' },
                { to: '/products?category=vegetables', label: 'Vegetables' },
                { to: '/products?category=fruits', label: 'Fruits' },
                { to: '/products?category=dairy', label: 'Dairy' },
              ],
            },
            {
              title: 'Features',
              links: [
                { to: '/recipes', label: 'Recipes' },
                { to: '/meal-planner', label: 'Meal Planner' },
                { to: '/nutrition', label: 'Nutrition' },
                { to: '/', label: 'AI Generator' },
              ],
            },
            {
              title: 'Account',
              links: [
                { to: '/profile', label: 'My Profile' },
                { to: '/orders', label: 'My Orders' },
                { to: '/cart', label: 'Cart' },
                { to: '/login', label: 'Login' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} GroceryAI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
