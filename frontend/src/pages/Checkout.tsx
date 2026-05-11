import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import { CheckCircle, ChevronRight, ImageOff, Lock } from 'lucide-react';

type Step = 'address' | 'review' | 'placing';

interface AddressForm {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const EMPTY_ADDRESS: AddressForm = { street: '', city: '', state: '', zip: '', country: 'US' };

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<AddressForm>(
    user?.address
      ? {
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          zip: user.address.zip || '',
          country: user.address.country || 'US',
        }
      : EMPTY_ADDRESS
  );
  const [error, setError] = useState('');

  if (!items.length) {
    navigate('/products');
    return null;
  }

  const shipping = total >= 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setStep('placing');
    setError('');
    try {
      const res = await orderApi.create({
        shippingAddress: address,
        paymentMethod: 'Credit Card',
      });
      await clearCart();
      navigate(`/orders/${res.data.order._id}/confirmation`);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to place order';
      setError(message || 'Failed to place order');
      setStep('review');
    }
  };

  const stepLabels = ['Shipping', 'Review', 'Confirmation'];
  const currentStepIndex = step === 'address' ? 0 : step === 'review' ? 1 : 2;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-10">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-sm font-medium ${i <= currentStepIndex ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < currentStepIndex ? 'bg-amber-600 text-white' :
                i === currentStepIndex ? 'border-2 border-amber-600 text-amber-600' :
                'border-2 border-gray-200 text-gray-400'
              }`}>
                {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {label}
            </div>
            {i < stepLabels.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {step === 'address' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Shipping Address</h2>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    required
                    placeholder="123 Main St, Apt 4B"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                      placeholder="New York"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State / Province</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                      placeholder="NY"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      required
                      placeholder="10001"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <select
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="IN">India</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition mt-2"
                >
                  Continue to Review
                </button>
              </form>
            </div>
          )}

          {(step === 'review' || step === 'placing') && (
            <div className="space-y-4">
              {/* Address summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">Shipping to</h2>
                  {step === 'review' && (
                    <button onClick={() => setStep('address')} className="text-sm text-amber-600 hover:underline">
                      Change
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  {address.street}, {address.city}, {address.state} {address.zip}, {address.country}
                </p>
              </div>

              {/* Items */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Order Items ({items.length})</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Demo mode — Credit Card (simulated)
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={step === 'placing'}
                className="w-full py-3.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-60 transition"
              >
                {step === 'placing' ? 'Placing Order...' : `Place Order — $${grandTotal.toFixed(2)}`}
              </button>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            {shipping === 0 && (
              <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-4">
                ✓ You qualify for free shipping!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
