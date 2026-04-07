import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=confirm
  const [form, setForm] = useState({
    fullName: '', address: '', city: '', postalCode: '', country: 'India', phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const shipping = cartTotal > 50 ? 0 : 5.99;
  const tax = parseFloat((cartTotal * 0.1).toFixed(2));
  const total = parseFloat((cartTotal + shipping + tax).toFixed(2));

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const items = cart.map((item) => ({ product: item.product._id, quantity: item.quantity }));
      const { data: order } = await api.post('/orders', { items, shippingAddress: form, paymentMethod });

      // For COD — order is placed, payment on delivery
      // For card — mark as paid immediately (demo)
      if (paymentMethod !== 'cod') {
        await api.put(`/orders/${order._id}/pay`, {
          paymentResult: { id: 'demo_' + Date.now(), status: 'paid' },
        });
      }

      toast.success('🎉 Order placed successfully!');
      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const isAddressValid = form.fullName && form.address && form.city && form.postalCode && form.phone;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[{ n: 1, label: 'Address' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Confirm' }].map(({ n, label }) => (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-2 ${step >= n ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{n}</div>
              <span className="text-sm font-medium hidden sm:block">{label}</span>
            </div>
            {n < 3 && <div className={`flex-1 h-1 rounded-full ${step > n ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Steps */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Address */}
          <div className={`card p-6 ${step !== 1 && 'opacity-60'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">📍 Shipping Address</h2>
              {step > 1 && <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline">Edit</button>}
            </div>
            {step === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'fullName', label: 'Full Name', placeholder: 'John Doe', col: 2 },
                  { key: 'address', label: 'Street Address', placeholder: '123 Main Street', col: 2 },
                  { key: 'city', label: 'City', placeholder: 'Mumbai' },
                  { key: 'postalCode', label: 'Postal Code', placeholder: '400001' },
                  { key: 'country', label: 'Country', placeholder: 'India' },
                  { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
                ].map(({ key, label, placeholder, col }) => (
                  <div key={key} className={col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium mb-1">{label} *</label>
                    <input
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="input"
                      required
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <button onClick={() => setStep(2)} disabled={!isAddressValid} className="btn-primary px-8 disabled:opacity-50">
                    Continue to Payment →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-white">{form.fullName}</p>
                <p>{form.address}, {form.city} {form.postalCode}</p>
                <p>{form.country} • {form.phone}</p>
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          {step >= 2 && (
            <div className={`card p-6 ${step !== 2 && 'opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">💳 Payment Method</h2>
                {step > 2 && <button onClick={() => setStep(2)} className="text-sm text-primary-600 hover:underline">Edit</button>}
              </div>
              {step === 2 ? (
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                    { value: 'stripe', label: '💳 Credit / Debit Card', desc: 'Secure payment via Stripe' },
                  ].map((m) => (
                    <label key={m.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === m.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} className="text-primary-600" />
                      <div>
                        <p className="font-medium">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setStep(3)} className="btn-primary px-8 mt-2">
                    Review Order →
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Credit/Debit Card'}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card p-6 border-2 border-primary-200 dark:border-primary-800">
              <h2 className="font-semibold text-lg mb-4">✅ Review & Place Order</h2>
              <div className="space-y-2 mb-5">
                {cart.map((item) => (
                  <div key={item.product._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full py-3 text-base font-semibold">
                {loading ? '⏳ Placing Order...' : `🛒 Place Order • $${total.toFixed(2)}`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                By placing this order you agree to our terms and conditions
              </p>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="card p-5 h-fit sticky top-20">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product._id} className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0 overflow-hidden">
                  {item.product.image ? <img src={item.product.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🛒</div>}
                </div>
                <span className="flex-1 truncate text-gray-600 dark:text-gray-400">{item.product.name} ×{item.quantity}</span>
                <span className="font-medium shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span><span className="text-primary-600">${total.toFixed(2)}</span>
            </div>
          </div>
          {cartTotal < 50 && (
            <p className="text-xs text-gray-400 mt-3 text-center">Add ${(50 - cartTotal).toFixed(2)} more for free shipping!</p>
          )}
        </div>
      </div>
    </div>
  );
}
