const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const userId = req.user.id;

    const newOrder = new Order({
      userId,
      products,
      totalAmount,
      orderStatus: 'Pending'
    });

    const order = await newOrder.save();

    // Decrease Stock
    for (const p of products) {
      await Product.findByIdAndUpdate(p.productId, { $inc: { stock: -p.quantity } });
    }

    // Loyalty Points (1 point per 100)
    const pointsEarned = Math.floor(totalAmount / 100);
    await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsEarned } });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email').populate('products.productId');
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const updateData = {};
    if (status) updateData.orderStatus = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Order removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
