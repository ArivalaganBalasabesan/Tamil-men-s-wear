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
    const { isValid, errors } = validatePromotion(req.body);
    if (!isValid) return res.status(400).json({ message: errors[0] });

    const existing = await Promotion.findOne({ code: req.body.code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Promotion code already exists' });

    const promo = new Promotion({
      ...req.body,
      code: req.body.code.toUpperCase()
    });

    await promo.save();
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
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
