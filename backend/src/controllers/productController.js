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
    const { occasion, productId } = req.query;
    
    // 1. If based on specific product, suggest matching category
    if (productId) {
      const currentProduct = await Product.findById(productId);
      if (currentProduct) {
        let matchCat = 'pants';
        if (currentProduct.category === 'pants') matchCat = 'shirts';
        
        const recommendations = await Product.find({ 
          category: matchCat,
          _id: { $ne: productId }
        }).limit(4);
        return res.json(recommendations);
      }
    }

    // 2. Occasion based
    if (occasion) {
      const products = await Product.find({ category: occasion }).limit(6);
      return res.json(products);
    }

    // 3. Fallback: Trending / Newest
    const products = await Product.find().sort({ createdAt: -1 }).limit(5);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
