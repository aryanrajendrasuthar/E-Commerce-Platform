import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Package className="w-6 h-6 text-amber-500" />
              <span className="text-white font-bold text-lg">ShopNow</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Your one-stop destination for premium products. Quality, convenience, and great prices guaranteed.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-white transition">Electronics</Link></li>
              <li><Link to="/products?category=Clothing" className="hover:text-white transition">Clothing</Link></li>
              <li><Link to="/products?category=Sports" className="hover:text-white transition">Sports</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">My Orders</Link></li>
              <li><Link to="/account" className="hover:text-white transition">Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ShopNow. Built with React, Node.js, MongoDB & Redis.</p>
        </div>
      </div>
    </footer>
  );
}
