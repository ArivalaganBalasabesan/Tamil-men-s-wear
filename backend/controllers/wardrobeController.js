const Wardrobe = require('../models/Wardrobe');

exports.getWardrobe = async (req, res) => {
  try {
    const wardrobe = await Wardrobe.findOne({ user: req.user.id }).populate('items.product');
    if (!wardrobe) return res.json({ items: [] });
    res.json(wardrobe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToWardrobe = async (req, res) => {
  try {
    const { products } = req.body; // Array of product IDs
    let wardrobe = await Wardrobe.findOne({ user: req.user.id });
    
    if (!wardrobe) {
      wardrobe = new Wardrobe({ user: req.user.id, items: [] });
    }
    
    const newItems = products.map(p => ({ product: p, purchaseDate: Date.now() }));
    wardrobe.items.push(...newItems);
    
    await wardrobe.save();
    res.json(wardrobe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
