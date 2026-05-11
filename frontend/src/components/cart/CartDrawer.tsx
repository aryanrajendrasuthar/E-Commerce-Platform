import { X, ShoppingBag, Trash2, Plus, Minus, ImageOff } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate(user ? '/checkout' : '/login?redirect=/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-gray-900">Your Cart</span>
            {items.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-gray-500 hover:text-red-500 transition">
                Clear all
              </button>
            )}
            <button onClick={closeCart} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <button
                onClick={() => { closeCart(); navigate('/products'); }}
                className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                  <p className="text-amber-700 font-semibold text-sm mt-1">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => item.quantity > 1 ? updateItem(item.productId, item.quantity - 1) : removeItem(item.productId)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeItem(item.productId)} className="ml-auto text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500">Shipping & taxes calculated at checkout</p>
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition"
            >
              Checkout → ${total.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
