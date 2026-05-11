const Product = require('../models/Product');
const { getRedis } = require('../config/redis');

const CART_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

const cartKey = (userId) => `cart:${userId}`;

exports.getCart = async (req, res) => {
  const redis = getRedis();
  const key = cartKey(req.user._id);
  const raw = await redis.hgetall(key);

  if (!raw || Object.keys(raw).length === 0) return res.json({ items: [], total: 0 });

  const items = Object.values(raw).map((v) => JSON.parse(v));
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json({ items, total: Math.round(total * 100) / 100 });
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId is required' });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.stock < 1) return res.status(400).json({ message: 'Product out of stock' });

  const redis = getRedis();
  const key = cartKey(req.user._id);
  const existing = await redis.hget(key, productId);
  const item = existing ? JSON.parse(existing) : null;
  const newQty = Math.min((item?.quantity || 0) + Number(quantity), product.stock);

  const cartItem = {
    productId,
    name: product.name,
    price: product.price,
    image: product.images[0] || null,
    quantity: newQty,
    stock: product.stock,
  };

  await redis.hset(key, productId, JSON.stringify(cartItem));
  await redis.expire(key, CART_TTL);
  res.json({ message: 'Added to cart', item: cartItem });
};

exports.updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const redis = getRedis();
  const key = cartKey(req.user._id);
  const existing = await redis.hget(key, productId);
  if (!existing) return res.status(404).json({ message: 'Item not in cart' });

  const item = { ...JSON.parse(existing), quantity: Math.min(Number(quantity), product.stock) };
  await redis.hset(key, productId, JSON.stringify(item));
  await redis.expire(key, CART_TTL);
  res.json({ message: 'Cart updated', item });
};

exports.removeFromCart = async (req, res) => {
  const redis = getRedis();
  await redis.hdel(cartKey(req.user._id), req.params.productId);
  res.json({ message: 'Item removed from cart' });
};

exports.clearCart = async (req, res) => {
  const redis = getRedis();
  await redis.del(cartKey(req.user._id));
  res.json({ message: 'Cart cleared' });
};
