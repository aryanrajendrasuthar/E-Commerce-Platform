import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Account from './pages/Account';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/checkout" element={
            <RequireAuth><Checkout /></RequireAuth>
          } />
          <Route path="/orders/:id/confirmation" element={
            <RequireAuth><OrderConfirmation /></RequireAuth>
          } />
          <Route path="/orders" element={
            <RequireAuth><OrderHistory /></RequireAuth>
          } />
          <Route path="/account" element={
            <RequireAuth><Account /></RequireAuth>
          } />

          <Route path="/admin" element={
            <RequireAdmin><AdminDashboard /></RequireAdmin>
          } />
          <Route path="/admin/products" element={
            <RequireAdmin><AdminProducts /></RequireAdmin>
          } />
          <Route path="/admin/orders" element={
            <RequireAdmin><AdminOrders /></RequireAdmin>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
