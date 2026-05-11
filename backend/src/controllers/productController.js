const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    minRating,
    sort = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const filter = {};

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minRating) filter.avgRating = { $gte: Number(minRating) };
  if (featured === 'true') filter.featured = true;

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { avgRating: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  };
  const sortObj = sortMap[sort] || { [sort]: order === 'asc' ? 1 : -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({
    products,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
};

exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
};

exports.getCategories = async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ categories });
};

exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const alreadyReviewed = product.ratings.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  if (!comment || comment.trim().length < 3) {
    return res.status(400).json({ message: 'Comment is required' });
  }

  product.ratings.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.updateRating();
  await product.save();
  res.status(201).json({ message: 'Review added', product });
};
