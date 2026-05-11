import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '../types';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) { setItems([]); setTotal(0); return; }
    try {
      const res = await cartApi.get();
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    setLoading(true);
    try {
      await cartApi.add(productId, quantity);
      await refreshCart();
      setIsOpen(true);
    } finally { setLoading(false); }
  };

  const updateItem = async (productId: string, quantity: number) => {
    await cartApi.update(productId, quantity);
    await refreshCart();
  };

  const removeItem = async (productId: string) => {
    await cartApi.remove(productId);
    await refreshCart();
  };

  const clearCart = async () => {
    await cartApi.clear();
    setItems([]);
    setTotal(0);
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, total, itemCount, isOpen, loading,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addToCart, updateItem, removeItem, clearCart, refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
