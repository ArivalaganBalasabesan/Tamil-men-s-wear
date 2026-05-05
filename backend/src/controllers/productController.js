const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const product = await newProduct.save();

    // Create corresponding Inventory record
    const Inventory = require('../models/Inventory');
    await new Inventory({ 
      product: product._id, 
      stockLevel: product.stock || 0 
    }).save();

    res.json(product);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    
    product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

    // Sync Inventory stock if it was updated
    if (req.body.stock !== undefined) {
      const Inventory = require('../models/Inventory');
      await Inventory.findOneAndUpdate({ product: product._id }, { stockLevel: product.stock });
    }

    res.json(product);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId);

    // Remove corresponding Inventory record
    const Inventory = require('../models/Inventory');
    await Inventory.findOneAndDelete({ product: productId });

    res.json({ msg: 'Product removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { occasion } = req.query; // 'formal', 'casual', 'festival'
    if (occasion) {
      const products = await Product.find({ category: occasion });
      return res.json(products);
    }
    const products = await Product.find().limit(5); // fallback
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
