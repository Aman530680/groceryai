import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    addToCart(product._id);
  };

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🛒</div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
        <span className="absolute top-2 left-2 badge bg-primary-100 text-primary-700 capitalize">{product.category}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-yellow-400">★</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{product.rating?.toFixed(1) || '0.0'} ({product.numReviews})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-primary-600">${product.price?.toFixed(2)}</span>
            <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary text-sm py-1.5 px-3"
          >
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
}
