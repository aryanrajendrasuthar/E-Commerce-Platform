const router = require('express').Router();
const {
  createProduct, updateProduct, deleteProduct,
  getAllOrders, updateOrderStatus, getDashboardStats,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.post('/products', upload.array('images', 5), createProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
