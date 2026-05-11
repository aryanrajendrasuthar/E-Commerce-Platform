import { Link } from 'react-router-dom';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { Product } from '../../types';
import StarRating from '../ui/StarRating';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product._id, 1);
    } finally {
      setAdding(false);
    }
  };

  const imgSrc = product.images?.[0] || '';
  const isOutOfStock = product.stock === 0;

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="w-12 h-12 text-gray-300" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          {product.featured && !isOutOfStock && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-amber-600 font-medium mb-1">{product.category}</p>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-amber-700 transition">
            {product.name}
          </h3>
          <StarRating rating={product.avgRating} count={product.numReviews} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {adding ? '...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
