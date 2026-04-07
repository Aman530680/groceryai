import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-primary-600 mb-3">
              <span>🥦</span><span>GroceryAI</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered grocery shopping and cooking assistant.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/products" className="hover:text-primary-600">All Products</Link></li>
              <li><Link to="/recipes" className="hover:text-primary-600">Recipes</Link></li>
              <li><Link to="/meal-planner" className="hover:text-primary-600">Meal Planner</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/profile" className="hover:text-primary-600">Profile</Link></li>
              <li><Link to="/orders" className="hover:text-primary-600">Orders</Link></li>
              <li><Link to="/nutrition" className="hover:text-primary-600">Nutrition</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><span>📧 support@groceryai.com</span></li>
              <li><span>🤖 AI Chatbot available 24/7</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} GroceryAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
