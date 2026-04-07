import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Spinner from '../ui/Spinner';
import { Link } from 'react-router-dom';

const STATUS_COLORS_MAP = {
  pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
  shipped: '#06b6d4', delivered: '#22c55e', cancelled: '#ef4444',
};

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { stats, recentOrders, salesByDay, ordersByStatus, lowStockProducts } = data;

  const statCards = [
    { label: 'Total Customers', value: stats.totalUsers, icon: '👥', color: 'bg-blue-500', change: '+12%' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-purple-500', change: '+8%' },
    { label: 'Products', value: stats.totalProducts, icon: '🛒', color: 'bg-yellow-500', change: '+3' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-green-500', change: '+15%' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-2xl`}>{s.icon}</div>
              <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full font-medium">{s.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Sales chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Sales — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesByDay}>
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Sales']} />
              <Bar dataKey="sales" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70}>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {ordersByStatus.map((s, i) => (
              <div key={s._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="capitalize text-gray-600 dark:text-gray-400">{s._id}</span>
                </div>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {order.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-600">${order.totalPrice.toFixed(2)}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                    style={{ backgroundColor: STATUS_COLORS_MAP[order.status] + '20', color: STATUS_COLORS_MAP[order.status] }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">⚠️ Low Stock Alert</h3>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:underline">Manage →</Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">All products are well stocked ✅</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
