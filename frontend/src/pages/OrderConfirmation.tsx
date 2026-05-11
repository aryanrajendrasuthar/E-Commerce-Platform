import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin } from 'lucide-react';
import { orderApi } from '../services/api';
import { Order } from '../types';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderApi.getOne(id)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block text-amber-600 hover:underline">View orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 text-sm">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <p className="text-xs text-gray-400 mt-2 font-mono">Order #{order._id}</p>
      </div>

      {/* Order details */}
      <div className="space-y-4">
        {/* Items */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" /> Items Ordered
          </h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-xl" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? <span className="text-green-600">Free</span> : `$${order.shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span><span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
              <span>Total</span><span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" /> Shipping Address
          </h2>
          <p className="text-sm text-gray-700">
            {order.shippingAddress.street}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
            {order.shippingAddress.country}
          </p>
        </div>

        {/* Status */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-600" /> Order Status
          </h2>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 capitalize">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {order.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          to="/orders"
          className="flex-1 text-center py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition text-sm"
        >
          View All Orders
        </Link>
        <Link
          to="/products"
          className="flex-1 text-center py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
