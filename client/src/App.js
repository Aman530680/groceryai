import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Chatbot from './components/ui/Chatbot';
import { PageLoader } from './components/ui/Spinner';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import RecipesPage from './pages/RecipesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MealPlannerPage from './pages/MealPlannerPage';
import NutritionPage from './pages/NutritionPage';
import ProfilePage from './pages/ProfilePage';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryLogin from './pages/DeliveryLogin';

import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminOrders from './components/admin/AdminOrders';
import AdminUsers from './components/admin/AdminUsers';
import AdminRecipes from './components/admin/AdminRecipes';

// Protect regular user routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

// Admin portal — show AdminLogin if not logged in as admin
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <AdminLogin />;
  if (user.role !== 'admin') return <AdminLogin />;
  return children;
}

// Delivery portal — show DeliveryLogin if not logged in as delivery
function DeliveryRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <DeliveryLogin />;
  if (!['delivery', 'admin'].includes(user.role)) return <DeliveryLogin />;
  return children;
}

function AppLayout() {
  const { loading } = useAuth();
  if (loading) return <PageLoader />;
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/meal-planner" element={<ProtectedRoute><MealPlannerPage /></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
              {/* Admin Portal — /admin/login shows AdminLogin, /admin/* requires admin role */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="recipes" element={<AdminRecipes />} />
              </Route>

              {/* Delivery Portal — /delivery/login shows DeliveryLogin */}
              <Route path="/delivery/login" element={<DeliveryLogin />} />
              <Route path="/delivery" element={<DeliveryRoute><DeliveryDashboard /></DeliveryRoute>} />

              {/* Main user app */}
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
