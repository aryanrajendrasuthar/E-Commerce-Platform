import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import { Order } from '../types';
import { Package, ChevronRight, ChevronLeft, ImageOff } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderApi.getAll({ page, limit: 10 })
      .then((res) => {
        setOrders(res.data.orders);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{total} order{total !== 1 ? 's' : ''} total</p>}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No orders yet</h3>
          <p className="text-gray-500 text-sm mt-1">Your orders will appear here after you make a purchase.</p>
          <Link
            to="/products"
            className="mt-6 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-sm transition">
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-gray-900">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">+{order.items.length - 4}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {order.items.slice(0, 2).map((i) => i.name).join(', ')}
                    {order.items.length > 2 ? ` + ${order.items.length - 2} more` : ''}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                  <Link
                    to={`/orders/${order._id}/confirmation`}
                    className="flex items-center gap-1 text-sm text-amber-600 font-medium hover:underline"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}
