const Promotion = require('../models/Promotion');

exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({ isActive: true, expiryDate: { $gte: new Date() } });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
    res.json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
    res.json({ message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validatePromoCode = async (req, res) => {
  try {
    const promotion = await Promotion.findOne({ 
      code: req.params.code, 
      isActive: true, 
      expiryDate: { $gte: new Date() } 
    });
    if (!promotion) return res.status(404).json({ message: 'Invalid or expired promo code' });
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
