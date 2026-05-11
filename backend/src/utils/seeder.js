require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');

const users = [
  { name: 'Admin User', email: 'admin@example.com', passwordHash: 'admin123', role: 'admin' },
  { name: 'John Doe', email: 'john@example.com', passwordHash: 'user1234', role: 'user' },
];

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for travel, work from home, or everyday listening.',
    price: 249.99,
    category: 'Electronics',
    stock: 45,
    featured: true,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    avgRating: 4.5,
    numReviews: 12,
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your health and fitness goals with this advanced smartwatch. Features heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water resistant up to 50m.',
    price: 199.99,
    category: 'Electronics',
    stock: 30,
    featured: true,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
    avgRating: 4.3,
    numReviews: 8,
  },
  {
    name: 'Mechanical Keyboard RGB',
    description: 'Tactile mechanical switches, customizable RGB backlighting, and a compact TKL design. Ideal for gaming and professional typing. USB-C connection.',
    price: 129.99,
    category: 'Electronics',
    stock: 20,
    featured: false,
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=600'],
    avgRating: 4.7,
    numReviews: 22,
  },
  {
    name: 'Premium Yoga Mat',
    description: 'Extra thick 6mm non-slip yoga mat made from eco-friendly TPE material. Includes carrying strap and is sweat-resistant. Perfect for yoga, pilates, and floor exercises.',
    price: 49.99,
    category: 'Sports',
    stock: 100,
    featured: false,
    images: ['https://images.unsplash.com/photo-1601925228992-e3bbed6a1e1a?w=600'],
    avgRating: 4.6,
    numReviews: 34,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall vacuum insulated 32oz bottle keeps drinks cold 24hrs or hot 12hrs. BPA-free, leak-proof lid, and durable powder-coated finish in multiple colors.',
    price: 34.99,
    category: 'Sports',
    stock: 150,
    featured: false,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'],
    avgRating: 4.8,
    numReviews: 56,
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'A seminal programming book by Douglas Crockford that distills the best features of JavaScript. Essential reading for any web developer serious about writing clean, reliable code.',
    price: 24.99,
    category: 'Books',
    stock: 75,
    featured: false,
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600'],
    avgRating: 4.4,
    numReviews: 41,
  },
  {
    name: 'Classic Leather Sneakers',
    description: 'Handcrafted leather upper with cushioned insole and rubber outsole. Timeless design that pairs with both casual and semi-formal outfits. Available in multiple sizes.',
    price: 89.99,
    category: 'Clothing',
    stock: 60,
    featured: true,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
    avgRating: 4.2,
    numReviews: 18,
  },
  {
    name: 'Minimalist Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness (3 levels), color temperature control, USB charging port, and 360° flexible neck. Energy efficient and eye-care certified.',
    price: 39.99,
    category: 'Home & Garden',
    stock: 80,
    featured: false,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'],
    avgRating: 4.5,
    numReviews: 29,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: '360° immersive sound with deep bass, waterproof IPX7 rating, and 20-hour playtime. Compact enough to fit in a bag yet powerful enough to fill a room. Perfect for outdoors.',
    price: 79.99,
    category: 'Electronics',
    stock: 55,
    featured: true,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'],
    avgRating: 4.6,
    numReviews: 37,
  },
  {
    name: 'Organic Face Moisturizer',
    description: 'Lightweight daily moisturizer with hyaluronic acid, vitamin C, and aloe vera. Suitable for all skin types. Dermatologist tested, cruelty-free, and 100% vegan. SPF 30.',
    price: 42.99,
    category: 'Beauty',
    stock: 90,
    featured: false,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    avgRating: 4.3,
    numReviews: 25,
  },
  {
    name: 'Running Shoes Pro',
    description: 'Engineered mesh upper for breathability with responsive foam cushioning and carbon fiber plate. Ideal for long-distance running and marathons. Lightweight at just 220g.',
    price: 159.99,
    category: 'Sports',
    stock: 40,
    featured: true,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
    avgRating: 4.7,
    numReviews: 63,
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs with comfortable handle and microwave-safe glaze. Each holds 12oz. Perfect gift set in a beautiful presentation box.',
    price: 29.99,
    category: 'Home & Garden',
    stock: 120,
    featured: false,
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600'],
    avgRating: 4.4,
    numReviews: 19,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany();
    await Product.deleteMany();

    // Hash passwords before creating
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({ ...u, passwordHash: await bcrypt.hash(u.passwordHash, 12) }))
    );
    await User.insertMany(hashedUsers);
    await Product.insertMany(products);

    console.log('✅ Seed data inserted successfully');
    console.log('Admin: admin@example.com / admin123');
    console.log('User:  john@example.com  / user1234');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
