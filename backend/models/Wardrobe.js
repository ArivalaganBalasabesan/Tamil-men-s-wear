const mongoose = require('mongoose');

const WardrobeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    purchaseDate: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Wardrobe', WardrobeSchema);
