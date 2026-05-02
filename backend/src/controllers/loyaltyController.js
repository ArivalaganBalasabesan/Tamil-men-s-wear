const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const User = require('../models/User');

exports.getLoyaltyInfo = async (req, res) => {
  try {
    const transactions = await LoyaltyTransaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user.id);
    
    const totalPoints = transactions.reduce((acc, curr) => {
      return curr.type === 'Earned' ? acc + curr.points : acc - curr.points;
    }, 0);
    
    res.json({ totalPoints, transactions, userTier: user.loyaltyTier });
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
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
