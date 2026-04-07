import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('shipped');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchDeliveries(); }, [filter]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/delivery/my-deliveries', { params: { status: filter || undefined } });
      setOrders(data);
    } catch { toast.error('Failed to load deliveries'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await api.put(`/delivery/${id}/status`, { status, note: `Marked as ${status} by delivery agent` });
      toast.success(`✅ Order marked as ${status}`);
      fetchDeliveries();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setUpdating(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const stats = {
    total: orders.length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-xl">🚚</div>
            <div>
              <div className="font-bold text-gray-800 dark:text-white">Delivery Dashboard</div>
              <div className="text-xs text-green-500">● {user?.name}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Assigned', value: stats.total, icon: '📦', color: 'bg-blue-500' },
            { label: 'To Deliver', value: stats.shipped, icon: '🚚', color: 'bg-yellow-500' },
            { label: 'Delivered', value: stats.delivered, icon: '✅', color: 'bg-green-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-xl mx-auto mb-2`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { value: '', label: 'All' },
            { value: 'shipped', label: '🚚 To Deliver' },
            { value: 'delivered', label: '✅ Delivered' },
          ].map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.value ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">No deliveries assigned to you yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`badge capitalize text-xs ${STATUS_STYLE[order.status]}`}>{order.status}</span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-white">{order.shippingAddress?.fullName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">📍 {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                    <p className="text-sm text-gray-500">📞 {order.shippingAddress?.phone}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span>📦 {order.items.length} items</span>
                      <span>💰 ${order.totalPrice.toFixed(2)}</span>
                      <span className={`text-xs ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.isPaid ? '✓ Paid' : order.paymentMethod === 'cod' ? '💵 COD' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => setSelected(order)} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-100 font-medium">
                      View Details
                    </button>
                    {order.status === 'shipped' && (
                      <button onClick={() => updateStatus(order._id, 'delivered')} disabled={updating}
                        className="text-xs bg-green-500 text-white px-3 py-2 rounded-xl hover:bg-green-600 font-medium disabled:opacity-50">
                        ✅ Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold">Order #{selected._id.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Address */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Delivery Address</p>
                <p className="font-semibold">{selected.shippingAddress?.fullName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selected.shippingAddress?.address}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selected.shippingAddress?.city}, {selected.shippingAddress?.postalCode}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selected.shippingAddress?.country}</p>
                <p className="text-sm font-medium text-primary-600 mt-1">📞 {selected.shippingAddress?.phone}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Items</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2 font-bold border-t border-gray-200 dark:border-gray-600">
                    <span>Total</span>
                    <span className="text-primary-600">${selected.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className={`rounded-xl p-3 text-sm font-medium ${selected.isPaid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {selected.isPaid ? '✅ Payment Received' : selected.paymentMethod === 'cod' ? '💵 Collect Cash on Delivery: $' + selected.totalPrice.toFixed(2) : '⏳ Payment Pending'}
              </div>

              {/* Action */}
              {selected.status === 'shipped' && (
                <button onClick={() => updateStatus(selected._id, 'delivered')} disabled={updating}
                  className="btn-primary w-full py-3 text-base disabled:opacity-50">
                  {updating ? 'Updating...' : '✅ Confirm Delivery'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
