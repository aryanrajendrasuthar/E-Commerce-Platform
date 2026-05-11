import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ImageOff, CheckCircle } from 'lucide-react';
import { Product } from '../types';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/ui/StarRating';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Review form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await productApi.getOne(id);
        setProduct(res.data.product);
      } catch {
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product!._id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setReviewError('Please select a rating'); return; }
    if (!comment.trim()) { setReviewError('Please write a comment'); return; }
    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await productApi.addReview(product!._id, { rating, comment });
      setProduct(res.data.product);
      setRating(0);
      setComment('');
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to submit review';
      setReviewError(message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const alreadyReviewed = user ? product.ratings.some((r) => r.user === user._id) : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-700 transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-gray-700 transition">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-gray-700 transition">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
            {product.images?.[selectedImg] ? (
              <img
                src={product.images[selectedImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-20 h-20 text-gray-300" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${i === selectedImg ? 'border-amber-500' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-amber-600 mb-2">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.avgRating} count={product.numReviews} size="md" />
            <span className="text-sm text-gray-500">{product.avgRating.toFixed(1)} out of 5</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mb-6">${product.price.toFixed(2)}</div>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 hover:bg-gray-50 transition text-lg font-medium"
                >−</button>
                <span className="px-4 py-2.5 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2.5 hover:bg-gray-50 transition text-lg font-medium"
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-lg transition ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {added ? (
                  <><CheckCircle className="w-5 h-5" /> Added!</>
                ) : adding ? (
                  'Adding...'
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                )}
              </button>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-2 text-sm text-amber-800">
            🚚 Free shipping on orders over $50
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Customer Reviews ({product.numReviews})
        </h2>

        {product.ratings.length > 0 && (
          <div className="space-y-4 mb-8">
            {product.ratings.map((r) => (
              <div key={r._id} className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                <p className="text-gray-700 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Write review */}
        {user && !alreadyReviewed && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <StarRating rating={rating} size="lg" interactive onRate={setRating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
              {reviewError && <p className="text-red-600 text-sm">{reviewError}</p>}
              <button
                type="submit"
                disabled={reviewLoading}
                className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50 transition"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
        {!user && (
          <p className="text-sm text-gray-600">
            <Link to="/login" className="text-amber-600 font-medium hover:underline">Sign in</Link> to write a review
          </p>
        )}
        {alreadyReviewed && (
          <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
            ✓ You have already reviewed this product
          </p>
        )}
      </div>
    </div>
  );
}
