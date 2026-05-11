const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getRedis } = require('../config/redis');

exports.createOrder = async (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress) return res.status(400).json({ message: 'Shipping address is required' });

  const redis = getRedis();
  const cartKey = `cart:${req.user._id}`;
  const raw = await redis.hgetall(cartKey);
  if (!raw || Object.keys(raw).length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const cartItems = Object.values(raw).map((v) => JSON.parse(v));

  // Validate stock and build order items atomically
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderItems = [];
    for (const item of cartItems) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}"`);
      }
      product.stock -= item.quantity;
      await product.save({ session });
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || null,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingCost = subtotal > 50 ? 0 : 9.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

    const [order] = await Order.create(
      [{ user: req.user._id, items: orderItems, shippingAddress, subtotal, shippingCost, tax, total, paidAt: new Date() }],
      { session }
    );

    await session.commitTransaction();
    await redis.del(cartKey);
    res.status(201).json({ order });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

exports.getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
};
