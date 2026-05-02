const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  stockLevel: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  lastRestocked: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
