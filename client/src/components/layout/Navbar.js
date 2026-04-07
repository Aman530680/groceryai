import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/products', label: 'Shop', icon: '🛒' },
    { to: '/recipes', label: 'Recipes', icon: '🍽️' },
    ...(user ? [
      { to: '/meal-planner', label: 'Meal Planner', icon: '📅' },
      { to: '/nutrition', label: 'Nutrition', icon: '📊' },
    ] : []),
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800'
          : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-lg shadow-md group-hover:shadow-green-300 transition-all duration-300 group-hover:scale-110">
                🥦
              </div>
              <div>
                <span className="font-black text-xl gradient-text">GroceryAI</span>
                <div className="text-xs text-gray-400 dark:text-gray-500 -mt-1 hidden sm:block">Smart Shopping</div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                    location.pathname === to
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-semibold'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
                title="Toggle theme"
              >
                <span className="text-lg">{dark ? '☀️' : '🌙'}</span>
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
              >
                <span className="text-lg">🛒</span>
                {cartCount > 0 && (
                  <span className="notification-dot animate-bounce-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-scale-in overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      {[
                        { to: '/profile', icon: '👤', label: 'My Profile' },
                        { to: '/orders', icon: '📦', label: 'My Orders' },
                        { to: '/meal-planner', icon: '📅', label: 'Meal Planner' },
                      ].map(({ to, icon, label }) => (
                        <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <span>{icon}</span>{label}
                        </Link>
                      ))}
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors font-semibold">
                          <span>⚙️</span> Admin Panel
                        </Link>
                      )}
                      {user.role === 'delivery' && (
                        <Link to="/delivery" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-semibold">
                          <span>🚚</span> Delivery Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <span>🚪</span> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="space-y-1.5">
                  <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fade-in-down">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, icon, label }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === to
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  <span>{icon}</span>{label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop */}
      {(menuOpen || mobileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setMenuOpen(false); setMobileOpen(false); }} />
      )}
    </>
  );
}
