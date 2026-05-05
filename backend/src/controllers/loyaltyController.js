const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const User = require('../models/User');
const Loyalty = require('../models/Loyalty');

// Admin only: Get all users merged with their loyalty data
exports.getAllLoyalty = async (req, res) => {
  try {
    // 1. Fetch ALL users from DB
    const users = await User.find({}).select('name email role').lean();
    
    // 2. Fetch ALL loyalty records
    const loyalties = await Loyalty.find({}).lean();

    // 3. Merge them manually to ensure 100% visibility
    const merged = users.map(u => {
      const l = loyalties.find(loy => loy.user && loy.user.toString() === u._id.toString());
      return {
        user: {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role
        },
        points: l ? l.points : 0,
        tier: l ? l.tier : 'Bronze'
      };
    });

    res.json(merged);
  } catch (error) {
    console.error('Loyalty Fetch Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getLoyaltyInfo = async (req, res) => {
  try {
    let loyalty = await Loyalty.findOne({ user: req.user.id }).populate('history');
    if (!loyalty) {
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
    
    const transaction = new LoyaltyTransaction({
      user: userId,
      points: parseInt(points),
      type,
      description: `[Admin Adjustment] ${description}`
    });
    await transaction.save();

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

exports.migrateData = async (req, res) => {
  try {
    const usersWithPoints = await User.find({ loyaltyPoints: { $gt: 0 } });
    let migratedCount = 0;

    for (const user of usersWithPoints) {
      await Loyalty.findOneAndUpdate(
        { user: user._id },
        { 
          $set: { points: user.loyaltyPoints },
          $setOnInsert: { tier: 'Bronze' } 
        },
        { upsert: true }
      );
      migratedCount++;
    }

    res.json({ message: `Successfully migrated ${migratedCount} users from legacy collection.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
