const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  stockLevel: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  lastRestocked: { type: Date, default: Date.now }
}, { timestamps: true });

// Middleware to sync back to Product collection
InventorySchema.post('save', async function(doc) {
  const Product = mongoose.model('Product');
  await Product.findByIdAndUpdate(doc.product, { stock: doc.stockLevel });
});

InventorySchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(doc.product, { stock: doc.stockLevel });
  }
});

module.exports = mongoose.model('Inventory', InventorySchema);
