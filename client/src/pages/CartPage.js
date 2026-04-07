import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

export default function CartPage() {
  const { cart, loading, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🛒</div>
      <h2 className="text-xl font-semibold mb-4">Please login to view your cart</h2>
      <Link to="/login" className="btn-primary">Login</Link>
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!cart.length) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🛒</div>
      <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  );

  const shipping = cartTotal > 50 ? 0 : 5.99;
  const tax = cartTotal * 0.1;
  const total = cartTotal + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🛒 Your Cart ({cartCount} items)</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Clear Cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.product?._id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl shrink-0">
                {item.product?.image ? (
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                ) : '🛒'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{item.product?.name}</h3>
                <p className="text-primary-600 font-semibold">${item.product?.price?.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold">${(item.product?.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-600" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary-600">${total.toFixed(2)}</span>
            </div>
          </div>
          {cartTotal < 50 && (
            <p className="text-xs text-gray-400 mt-3">Add ${(50 - cartTotal).toFixed(2)} more for free shipping!</p>
          )}
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4 py-3">
            Proceed to Checkout
          </button>
          <Link to="/products" className="block text-center text-sm text-primary-600 mt-3 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
