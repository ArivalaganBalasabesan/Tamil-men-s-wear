const express = require('express');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();

// Admin middleware to verify role
const adminAuth = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

router.get('/stats', protect, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId');
    const products = await Product.find();
    
    let totalRevenue = 0;
    const monthlySales = {};
    const categorySales = {};

    orders.forEach(o => {
      if (o.paymentStatus === 'Completed') {
        totalRevenue += o.totalAmount;
        
        // Monthly trend
        const month = new Date(o.createdAt).toLocaleString('default', { month: 'short' });
        monthlySales[month] = (monthlySales[month] || 0) + o.totalAmount;

        // Category breakdown (assuming products are populated or we calculate from items)
        o.products.forEach(p => {
          // This is a bit simplified, ideally we find the product's category
        });
      }
    });

    const usersCount = await User.countDocuments({ role: 'user' });
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      usersCount,
      lowStockCount,
      monthlySales,
      categoryDistribution: products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {})
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/customers', protect, adminAuth, async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }).select('-password');
    res.json(customers);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.put('/stock/:id', protect, adminAuth, async (req, res) => {
  try {
    const { stock } = req.body;
    let product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/low-stock', protect, adminAuth, async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 5 } });
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
