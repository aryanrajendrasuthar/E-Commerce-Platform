import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { Product } from '../types';
import { productApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { name: 'Clothing', emoji: '👕', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { name: 'Sports', emoji: '🏃', color: 'bg-green-50 text-green-700 border-green-100' },
  { name: 'Home & Garden', emoji: '🏠', color: 'bg-orange-50 text-orange-700 border-orange-100' },
  { name: 'Books', emoji: '📚', color: 'bg-red-50 text-red-700 border-red-100' },
  { name: 'Beauty', emoji: '✨', color: 'bg-pink-50 text-pink-700 border-pink-100' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: Shield, title: 'Secure Payment', desc: '100% protected checkout' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'We are always here' },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, newRes] = await Promise.all([
          productApi.getAll({ featured: true, limit: 4 }),
          productApi.getAll({ sort: 'newest', limit: 4 }),
        ]);
        setFeatured(featuredRes.data.products);
        setNewArrivals(newRes.data.products);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNTllMGIiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDB2Nmg2di02aC02em0tNi02djZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-block bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              🛍️ New Season, New Deals
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Shop the Best,{' '}
              <span className="text-amber-600">Pay Less</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover thousands of premium products across all categories. Quality guaranteed, prices that won't break the bank.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white font-semibold rounded-2xl hover:bg-amber-700 transition text-lg shadow-lg shadow-amber-200"
              >
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/products?featured=true"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-50 transition text-lg border border-gray-200"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-10 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-amber-600 text-sm font-medium hover:underline flex items-center gap-1">
            All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map(({ name, emoji, color }) => (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${color} hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-semibold text-center leading-tight">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products?featured=true" className="text-amber-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-3xl p-10 md:p-14 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Free Shipping on Orders $50+</h2>
          <p className="text-amber-100 text-lg mb-8">Fill your cart and we'll cover the delivery.</p>
          <Link
            to="/products"
            className="inline-block px-8 py-3.5 bg-white text-amber-700 font-bold rounded-2xl hover:bg-amber-50 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-amber-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
