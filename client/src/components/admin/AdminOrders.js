import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLE = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [agents, setAgents] = useState([]);
  const [assignId, setAssignId] = useState('');

  useEffect(() => { fetchOrders(); fetchAgents(); }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders', {
        params: { status: statusFilter || undefined, search: search || undefined },
      });
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const fetchAgents = async () => {
    try {
      const { data } = await api.get('/admin/delivery-agents');
      setAgents(data);
    } catch {}
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
      if (selected?._id === id) setSelected((prev) => ({ ...prev, status }));
    } catch { toast.error('Failed to update status'); }
  };

  const assignDelivery = async (orderId) => {
    if (!assignId) { toast.error('Select a delivery agent'); return; }
    try {
      await api.put(`/admin/orders/${orderId}/assign`, { deliveryUserId: assignId });
      toast.success('Delivery agent assigned & order shipped!');
      setAssignId('');
      fetchOrders();
      setSelected(null);
    } catch { toast.error('Failed to assign'); }
  };

  const filtered = orders.filter((o) =>
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o._id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by customer or order ID..."
          className="input flex-1"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button onClick={fetchOrders} className="btn-primary px-4">Search</button>
      </div>

      {/* Status count pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${statusFilter === s ? STATUS_STYLE[s] + ' ring-2 ring-offset-1' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>
                ) : filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">{order.user?.name}</p>
                        <p className="text-xs text-gray-400">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{order.items.length} items</td>
                    <td className="px-5 py-4 font-bold text-primary-600">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isPaid ? '✓ Paid' : order.paymentMethod === 'cod' ? 'COD' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge capitalize ${STATUS_STYLE[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(order)} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
                          View
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Order #{selected._id.slice(-8).toUpperCase()}</h2>
                <p className="text-sm text-gray-400">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Customer</p>
                  <p className="font-semibold">{selected.user?.name}</p>
                  <p className="text-sm text-gray-500">{selected.user?.email}</p>
                  <p className="text-sm text-gray-500">{selected.user?.phone}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Shipping Address</p>
                  <p className="font-semibold">{selected.shippingAddress?.fullName}</p>
                  <p className="text-sm text-gray-500">{selected.shippingAddress?.address}</p>
                  <p className="text-sm text-gray-500">{selected.shippingAddress?.city}, {selected.shippingAddress?.postalCode}</p>
                  <p className="text-sm text-gray-500">{selected.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Order Items</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
                      <span className="text-sm">{item.name} × {item.quantity}</span>
                      <span className="font-semibold text-primary-600">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-2 font-bold border-t border-gray-200 dark:border-gray-600">
                    <span>Total</span>
                    <span className="text-primary-600">${selected.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status History */}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Status Timeline</p>
                <div className="space-y-2">
                  {(selected.statusHistory || []).map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                      <div>
                        <span className={`badge capitalize text-xs ${STATUS_STYLE[h.status]}`}>{h.status}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(h.updatedAt).toLocaleString()}</span>
                        {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign Delivery */}
              {!['delivered', 'cancelled'].includes(selected.status) && agents.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-sm font-semibold mb-3">🚚 Assign Delivery Agent</p>
                  <div className="flex gap-3">
                    <select value={assignId} onChange={(e) => setAssignId(e.target.value)} className="input flex-1">
                      <option value="">Select agent...</option>
                      {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                    <button onClick={() => assignDelivery(selected._id)} className="btn-primary px-4">Assign</button>
                  </div>
                </div>
              )}

              {/* Quick status update */}
              <div className="flex gap-3 flex-wrap">
                {STATUS_OPTIONS.filter((s) => s !== selected.status).map((s) => (
                  <button key={s} onClick={() => { updateStatus(selected._id, s); setSelected((p) => ({ ...p, status: s })); }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${STATUS_STYLE[s]}`}>
                    Mark as {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
