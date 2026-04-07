import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-green-100 text-green-700',
};

const STATUS_ICON = {
  confirmed:  '✅',
  processing: '⚙️',
  shipped:    '🚚',
  delivered:  '🎉',
};

// What button to show next based on current status
const NEXT_STATUS = {
  confirmed:  { status: 'processing', label: '⚙️ Start Processing',   color: 'bg-purple-500 hover:bg-purple-600' },
  processing: { status: 'shipped',    label: '🚚 Mark as Shipped',     color: 'bg-cyan-500 hover:bg-cyan-600' },
  shipped:    { status: 'delivered',  label: '✅ Confirm Delivered',   color: 'bg-green-500 hover:bg-green-600' },
};

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/delivery/my-deliveries');
      setAllOrders(data);
    } catch {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      const { data: updated } = await api.put(`/delivery/${id}/status`, { status });
      toast.success(`✅ Order marked as ${status}`);
      // update in-place so UI reflects immediately
      setAllOrders((prev) => prev.map((o) => o._id === id ? updated : o));
      if (selected?._id === id) setSelected(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/delivery/login'); };

  const activeOrders    = allOrders.filter((o) => ['confirmed', 'processing', 'shipped'].includes(o.status));
  const deliveredOrders = allOrders.filter((o) => o.status === 'delivered');
  const displayOrders   = tab === 'active' ? activeOrders : deliveredOrders;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-xl">🚚</div>
            <div>
              <div className="font-bold text-gray-800 dark:text-white">Delivery Dashboard</div>
              <div className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                {user?.name}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total',      value: allOrders.length,                                          icon: '📦', color: 'bg-blue-500' },
            { label: 'Processing', value: allOrders.filter((o) => o.status === 'processing').length, icon: '⚙️', color: 'bg-purple-500' },
            { label: 'Shipped',    value: allOrders.filter((o) => o.status === 'shipped').length,    icon: '🚚', color: 'bg-cyan-500' },
            { label: 'Delivered',  value: deliveredOrders.length,                                    icon: '✅', color: 'bg-green-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center text-lg mx-auto mb-1.5`}>{s.icon}</div>
              <div className="text-xl font-bold text-gray-800 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'active' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            🚚 Active Orders
            {activeOrders.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === 'active' ? 'bg-white/20' : 'bg-cyan-100 text-cyan-700'}`}>
                {activeOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'history' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            ✅ Delivered History
            {deliveredOrders.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === 'history' ? 'bg-white/20' : 'bg-green-100 text-green-700'}`}>
                {deliveredOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : displayOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-4">{tab === 'active' ? '📭' : '📋'}</div>
            <p className="text-gray-500 font-medium">
              {tab === 'active' ? 'No active orders assigned to you' : 'No delivery history yet'}
            </p>
            {tab === 'active' && <p className="text-xs text-gray-400 mt-1">Admin will assign orders to you</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => (
              <div key={order._id} className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-2 transition-all hover:shadow-md ${
                order.status === 'delivered'  ? 'border-green-200 dark:border-green-800' :
                order.status === 'shipped'    ? 'border-cyan-200 dark:border-cyan-800' :
                order.status === 'processing' ? 'border-purple-200 dark:border-purple-800' :
                'border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* ID + Status */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`badge capitalize text-xs ${STATUS_STYLE[order.status]}`}>
                        {STATUS_ICON[order.status]} {order.status}
                      </span>
                    </div>

                    {/* Customer info */}
                    <p className="font-semibold text-gray-800 dark:text-white">{order.shippingAddress?.fullName}</p>
                    <p className="text-sm text-gray-500">📍 {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}</p>
                    <p className="text-sm text-gray-500">📞 {order.shippingAddress?.phone}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500">📦 {order.items.length} items</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">💰 ${order.totalPrice.toFixed(2)}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isPaid ? '✓ Paid' : order.paymentMethod === 'cod' ? '💵 Collect COD' : 'Unpaid'}
                      </span>
                      {order.status === 'delivered' && order.deliveredAt && (
                        <span className="text-xs text-gray-400">
                          🕐 {new Date(order.deliveredAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setSelected(order)}
                      className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-100 font-medium transition-colors"
                    >
                      View Details
                    </button>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => updateStatus(order._id, NEXT_STATUS[order.status].status)}
                        disabled={updating}
                        className={`text-xs text-white px-3 py-2 rounded-xl font-medium disabled:opacity-50 transition-colors ${NEXT_STATUS[order.status].color}`}
                      >
                        {updating ? '...' : NEXT_STATUS[order.status].label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800 dark:text-white">Order #{selected._id.slice(-8).toUpperCase()}</h2>
                <p className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-5 space-y-4">

              {/* Current Status */}
              <div className={`rounded-xl p-3 text-sm font-semibold text-center ${STATUS_STYLE[selected.status]}`}>
                {STATUS_ICON[selected.status]} Current Status: <span className="capitalize">{selected.status}</span>
                {selected.status === 'delivered' && selected.deliveredAt && (
                  <p className="text-xs font-normal mt-0.5 opacity-80">
                    Delivered on {new Date(selected.deliveredAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">📍 Delivery Address</p>
                <p className="font-semibold text-gray-800 dark:text-white">{selected.shippingAddress?.fullName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selected.shippingAddress?.address}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selected.shippingAddress?.city}, {selected.shippingAddress?.postalCode}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selected.shippingAddress?.country}</p>
                <p className="text-sm font-medium text-cyan-600 mt-1">📞 {selected.shippingAddress?.phone}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">📦 Items</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2 font-bold border-t border-gray-200 dark:border-gray-600">
                    <span>Total</span>
                    <span className="text-cyan-600">${selected.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className={`rounded-xl p-3 text-sm font-medium ${selected.isPaid ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700'}`}>
                {selected.isPaid ? '✅ Payment Received' : selected.paymentMethod === 'cod' ? `💵 Collect Cash: $${selected.totalPrice.toFixed(2)}` : '⏳ Payment Pending'}
              </div>

              {/* Status Timeline */}
              {selected.statusHistory?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-2">🕐 Status Timeline</p>
                  <div className="space-y-2">
                    {[...selected.statusHistory].reverse().map((h, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`badge capitalize text-xs ${STATUS_STYLE[h.status] || 'bg-gray-100 text-gray-600'}`}>{h.status}</span>
                            <span className="text-xs text-gray-400">{new Date(h.updatedAt).toLocaleString()}</span>
                            {h.updatedBy && <span className="text-xs text-gray-400">by {h.updatedBy}</span>}
                          </div>
                          {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Action Button */}
              {NEXT_STATUS[selected.status] && (
                <button
                  onClick={() => updateStatus(selected._id, NEXT_STATUS[selected.status].status)}
                  disabled={updating}
                  className={`w-full text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-md text-base ${NEXT_STATUS[selected.status].color}`}
                >
                  {updating ? '⏳ Updating...' : NEXT_STATUS[selected.status].label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
