import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Order } from '../../types';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [page]); // eslint-disable-line

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ page, limit: 15 });
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await adminApi.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o._id === orderId ? res.data.order : o));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{total} total orders</p>
      </div>

      {loading ? (
        <div className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-6 py-3 text-left">Order</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <>
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        {order.user && typeof order.user === 'object' ? (
                          <>
                            <p className="text-sm font-medium text-gray-900">{(order.user as { name: string }).name}</p>
                            <p className="text-xs text-gray-500">{(order.user as { email: string }).email}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Deleted user</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={updatingId === order._id}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize appearance-none pr-6 cursor-pointer disabled:opacity-50 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="bg-white text-gray-900 capitalize">{s}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === order._id ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === order._id && (
                      <tr key={`${order._id}-expanded`}>
                        <td colSpan={7} className="px-6 pb-4 bg-gray-50">
                          <div className="pt-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Order Items</p>
                            <div className="space-y-2">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                  <div className="w-8 h-8 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                                  </div>
                                  <span className="text-gray-700 flex-1">{item.name}</span>
                                  <span className="text-gray-500">×{item.quantity}</span>
                                  <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                              <span className="font-medium">Ship to: </span>
                              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                p === page ? 'bg-amber-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
