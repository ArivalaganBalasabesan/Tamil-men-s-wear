const mongoose = require('mongoose');

const LoyaltySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LoyaltyTransaction' }]
}, { timestamps: true });

module.exports = mongoose.model('Loyalty', LoyaltySchema);
