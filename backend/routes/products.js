const express = require('express');
const { protect } = require('../middleware/auth');
const { getProducts, createProduct, updateProduct, deleteProduct, getRecommendations } = require('../controllers/productController');
const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
