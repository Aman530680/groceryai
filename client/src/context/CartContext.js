import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else setCart([]);
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {}
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const { data } = await api.post('/cart/add', { productId, quantity });
      setCart(data);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const addMissingIngredients = async (ingredients) => {
    try {
      setLoading(true);
      const { data } = await api.post('/cart/add-missing', { ingredients });
      setCart(data.cart);
      toast.success(`Added ${data.added.length} items to cart!`);
      return data.added;
    } catch (err) {
      toast.error('Failed to add ingredients');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCart(data);
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart([]);
    } catch {}
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, addMissingIngredients, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
