const router = require('express').Router();
const { getProducts, getProduct, getCategories, addReview } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
