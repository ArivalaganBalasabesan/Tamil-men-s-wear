const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder, getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders); // Admin route
router.get('/user', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
