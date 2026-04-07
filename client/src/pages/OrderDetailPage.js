import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STEP_ICONS = { pending: '🕐', confirmed: '✅', processing: '⚙️', shipped: '🚚', delivered: '🎉' };
const STATUS_STYLE = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const currentStep = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-gray-500 text-sm mt-1">#{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`badge text-sm px-3 py-1.5 capitalize ${STATUS_STYLE[order.status]}`}>{order.status}</span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-5">Order Progress</h2>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 dark:bg-gray-600 rounded-full">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: currentStep >= 0 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : '0%' }}
              />
            </div>
            <div className="relative flex justify-between">
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all z-10 ${
                      done ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    } ${active ? 'ring-4 ring-primary-200 dark:ring-primary-900' : ''}`}>
                      {done ? (i < currentStep ? '✓' : STEP_ICONS[step]) : <span className="text-gray-400 text-sm">{i + 1}</span>}
                    </div>
                    <span className={`text-xs capitalize font-medium ${done ? 'text-primary-600' : 'text-gray-400'}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <p className="text-red-700 dark:text-red-400 font-semibold">❌ Order Cancelled</p>
          {order.cancelReason && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{order.cancelReason}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Items */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : '🛒'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-primary-600">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
              <div className="flex justify-between text-gray-500"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100 dark:border-gray-700">
                <span>Total</span><span className="text-primary-600">${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="text-primary-600 font-medium">📞 {order.shippingAddress?.phone}</p>
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Payment Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium capitalize">{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Card (Stripe)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.isPaid ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid at</span>
                  <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {order.statusHistory?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Status Timeline</h2>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge capitalize text-xs ${STATUS_STYLE[h.status]}`}>{h.status}</span>
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

      <div className="mt-5 flex gap-3">
        <Link to="/orders" className="btn-secondary">← Back to Orders</Link>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
