const mongoose = require('mongoose');

const LoyaltyTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  type: { type: String, enum: ['Earned', 'Redeemed'], required: true },
  description: { type: String },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyTransaction', LoyaltyTransactionSchema);
