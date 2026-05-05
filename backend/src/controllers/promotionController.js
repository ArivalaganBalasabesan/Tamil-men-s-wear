const Promotion = require('../models/Promotion');
const { validatePromotion } = require('../validations/promotionValidation');

exports.getPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching promotions' });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchaseAmount, startDate, expiryDate, endDate, description } = req.body;
    
    const finalExpiry = expiryDate || endDate;
    
    if (!finalExpiry) {
      return res.status(400).json({ message: 'Expiry date is required' });
    }

    const existing = await Promotion.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Promotion code already exists' });

    const promo = new Promotion({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchaseAmount,
      startDate: startDate || new Date(),
      expiryDate: finalExpiry,
      description
    });
    
    await promo.save();
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const { expiryDate, endDate } = req.body;
    const updateData = { ...req.body };
    if (endDate && !expiryDate) updateData.expiryDate = endDate;

    const promo = await Promotion.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!promo) return res.status(404).json({ message: 'Promotion not found' });
    res.json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.validatePromo = async (req, res) => {
  try {
    const promo = await Promotion.findOne({ 
      code: req.params.code.toUpperCase(),
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    
    if (!promo) {
      return res.status(404).json({ message: 'Invalid or expired promotion code' });
    }
    
    res.json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promotion not found' });
    res.json({ message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
