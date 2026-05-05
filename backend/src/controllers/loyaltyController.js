const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const User = require('../models/User');
const Loyalty = require('../models/Loyalty');

exports.getLoyaltyInfo = async (req, res) => {
  try {
    let loyalty = await Loyalty.findOne({ user: req.user.id }).populate('history');
    if (!loyalty) {
      // Lazy initialize
      loyalty = new Loyalty({ user: req.user.id });
      await loyalty.save();
    }
    const transactions = await LoyaltyTransaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.json({
      totalPoints: loyalty.points,
      userTier: loyalty.tier,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin only: Get all users merged with their loyalty data
exports.getAllLoyalty = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('name email');
    const loyalties = await Loyalty.find();

    const merged = users.map(user => {
      const loyalty = loyalties.find(l => l.user.toString() === user._id.toString());
      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        points: loyalty ? loyalty.points : 0,
        tier: loyalty ? loyalty.tier : 'Bronze'
      };
    });

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addPoints = async (req, res) => {
  try {
    const { points, description, orderId } = req.body;
    
    const transaction = new LoyaltyTransaction({
      user: req.user.id,
      points,
      type: 'Earned',
      description,
      order: orderId
    });
    await transaction.save();

    await Loyalty.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { points: points }, $push: { history: transaction._id } },
      { upsert: true }
    );

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.adminAdjustPoints = async (req, res) => {
  try {
    const { userId, points, type, description } = req.body;
    
    // Create transaction
    const transaction = new LoyaltyTransaction({
      user: userId,
      points,
      type, // 'Earned' or 'Redeemed'
      description: `[Admin Adjustment] ${description}`
    });
    await transaction.save();

    // Update Loyalty collection
    const inc = type === 'Earned' ? parseInt(points) : -parseInt(points);
    const loyalty = await Loyalty.findOneAndUpdate(
      { user: userId },
      { $inc: { points: inc }, $push: { history: transaction._id } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Points adjusted successfully', currentPoints: loyalty.points });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
