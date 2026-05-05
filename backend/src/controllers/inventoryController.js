const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const products = await Product.find();
    
    // Ensure every product has an inventory record
    for (const prod of products) {
      const exists = await Inventory.findOne({ product: prod._id });
      if (!exists) {
        await new Inventory({ 
          product: prod._id, 
          stockLevel: prod.stock || 0,
          lowStockThreshold: 5 
        }).save();
      } else if (exists.stockLevel !== prod.stock) {
        // Sync if out of alignment
        exists.stockLevel = prod.stock;
        await exists.save();
      }
    }

    const inventory = await Inventory.find().populate('product');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await Inventory.find({
      $expr: { $lte: ['$stockLevel', '$lowStockThreshold'] }
    }).populate('product');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { product, stockLevel, lowStockThreshold } = req.body;
    let item = await Inventory.findOne({ product });
    
    if (item) {
      item.stockLevel = stockLevel !== undefined ? stockLevel : item.stockLevel;
      item.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : item.lowStockThreshold;
      item.lastRestocked = Date.now();
    } else {
      item = new Inventory({ product, stockLevel, lowStockThreshold });
    }
    
    await item.save();

    // Sync back to Product model
    const Product = require('../models/Product');
    await Product.findByIdAndUpdate(product, { stock: stockLevel });

    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
