import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    await addToCart(product._id);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 card-glow">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-300">🛒</span>
          </div>
        )}

        {/* Overlays */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="badge bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 shadow-sm capitalize backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-orange-100 text-orange-700 shadow-sm">Only {product.stock} left!</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex">
            {[1,2,3,4,5].map((star) => (
              <span key={star} className={`text-xs ${star <= Math.round(product.rating || 0) ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}>★</span>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-black text-green-600 dark:text-green-400">${Number(product.price).toFixed(2)}</span>
            <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95 ${
              added
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-200 dark:hover:shadow-green-900 hover:scale-105'
            }`}
          >
            {adding ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : added ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
