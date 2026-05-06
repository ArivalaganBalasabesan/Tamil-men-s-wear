const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const products = await Product.find();
    
    // If collection was dropped, this will be []
    const existingProductIds = await Inventory.find().distinct('product');
    const existingProductIdsStr = existingProductIds.map(id => id.toString());
    
    const missingProducts = products.filter(p => !existingProductIdsStr.includes(p._id.toString()));

    for (const p of products) {
      await Inventory.updateOne(
        { product: p._id },
        { $setOnInsert: { stockLevel: p.stock || 0, lowStockThreshold: 10 } },
        { upsert: true }
      );
    }

    const inventory = await Inventory.find().populate('product').sort({ createdAt: -1 });
    const cleanInventory = inventory.filter(item => item.product !== null);
    res.json(cleanInventory);
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
    
    // Validation
    if (stockLevel !== undefined && (isNaN(stockLevel) || stockLevel < 0)) {
       return res.status(400).json({ message: 'Stock level must be a non-negative number' });
    }
    if (lowStockThreshold !== undefined && (isNaN(lowStockThreshold) || lowStockThreshold < 0)) {
       return res.status(400).json({ message: 'Threshold must be a non-negative number' });
    }

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
