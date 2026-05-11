const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Products
exports.createProduct = async (req, res) => {
  const { name, description, price, category, stock, featured } = req.body;
  if (!name || !description || price == null || !category || stock == null) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
  const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    stock: Number(stock),
    images,
    featured: featured === 'true',
  });
  res.status(201).json({ product });
};

exports.updateProduct = async (req, res) => {
  const { name, description, price, category, stock, featured } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (name) product.name = name;
  if (description) product.description = description;
  if (price != null) product.price = Number(price);
  if (category) product.category = category;
  if (stock != null) product.stock = Number(stock);
  if (featured !== undefined) product.featured = featured === 'true';

  if (req.files && req.files.length > 0) {
    product.images = req.files.map((f) => `/uploads/${f.filename}`);
  }

  await product.save();
  res.json({ product });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  // Clean up uploaded files
  product.images.forEach((img) => {
    const filePath = path.join(__dirname, '../../', img);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
  res.json({ message: 'Product deleted' });
};

// Orders
exports.getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, ...(status === 'delivered' ? { deliveredAt: new Date() } : {}) },
    { new: true }
  ).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
};

// Stats
exports.getDashboardStats = async (req, res) => {
  const [totalProducts, totalOrders, totalUsers, recentOrders] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
  ]);

  const revenueResult = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const revenue = revenueResult[0]?.total || 0;

  res.json({ totalProducts, totalOrders, totalUsers, revenue, recentOrders });
};
