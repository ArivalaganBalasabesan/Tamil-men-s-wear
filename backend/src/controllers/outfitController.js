const Outfit = require('../models/Outfit');

exports.getMyOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({ user: req.user.id }).populate('products');
    res.json(outfits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({ isPublic: true }).populate('products');
    res.json(outfits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOutfit = async (req, res) => {
  try {
    const outfit = new Outfit({
      ...req.body,
      user: req.user.id
    });
    await outfit.save();
    res.status(201).json(outfit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!outfit) return res.status(404).json({ message: 'Outfit not found or not authorized' });
    res.json({ message: 'Outfit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getSmartSuggestions = async (req, res) => {
  try {
    const { category } = req.query; // e.g., 'Office', 'Casual'
    const Product = require('../models/Product');
    
    // Find products in categories that match
    const tops = await Product.find({ category, name: { $regex: /shirt|tshirt|top/i } }).limit(2);
    const bottoms = await Product.find({ category, name: { $regex: /pant|trouser|jean/i } }).limit(2);
    const shoes = await Product.find({ category, name: { $regex: /shoe|boot/i } }).limit(2);

    const suggestions = [];
    if (tops[0] && bottoms[0]) {
      suggestions.push({
        name: `${category} Standard Set`,
        products: [tops[0]._id, bottoms[0]._id, shoes[0]?._id].filter(Boolean),
        description: `A perfectly matched ${category} outfit.`
      });
    }

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
