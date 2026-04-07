import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📦 My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p>No orders yet</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <span key={item._id} className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-semibold text-primary-600">${order.totalPrice.toFixed(2)}</span>
                <Link to={`/orders/${order._id}`} className="text-sm text-primary-600 hover:underline">View Details →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
