import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const STATUS_ICON = {
  pending:    '🕐',
  confirmed:  '✅',
  processing: '⚙️',
  shipped:    '🚚',
  delivered:  '🎉',
  cancelled:  '❌',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds to show live status updates
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📦 My Orders</h1>
        <button onClick={fetchOrders} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p>No orders yet</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className={`card p-6 border-l-4 ${
              order.status === 'delivered'  ? 'border-l-green-500' :
              order.status === 'shipped'    ? 'border-l-cyan-500' :
              order.status === 'processing' ? 'border-l-purple-500' :
              order.status === 'confirmed'  ? 'border-l-blue-500' :
              order.status === 'cancelled'  ? 'border-l-red-500' :
              'border-l-yellow-500'
            }`}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`badge text-sm px-3 py-1 capitalize font-semibold ${STATUS_COLORS[order.status]}`}>
                  {STATUS_ICON[order.status]} {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="mt-3 flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <span key={item._id} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              {order.status !== 'cancelled' && (
                <div className="mt-4">
                  {(() => {
                    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                    const current = steps.indexOf(order.status);
                    return (
                      <div className="flex items-center gap-1">
                        {steps.map((step, i) => (
                          <React.Fragment key={step}>
                            <div className={`flex flex-col items-center`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                i <= current ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-400'
                              }`}>
                                {i < current ? '✓' : i + 1}
                              </div>
                              <span className={`text-xs mt-1 capitalize hidden sm:block ${i <= current ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                                {step}
                              </span>
                            </div>
                            {i < steps.length - 1 && (
                              <div className={`flex-1 h-1 rounded-full mb-4 ${i < current ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <span className="font-bold text-primary-600 text-lg">${order.totalPrice.toFixed(2)}</span>
                  <span className={`ml-3 text-xs font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.isPaid ? '✓ Paid' : order.paymentMethod === 'cod' ? '💵 COD' : '⏳ Pending'}
                  </span>
                </div>
                <Link to={`/orders/${order._id}`} className="text-sm text-primary-600 hover:underline font-medium">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
