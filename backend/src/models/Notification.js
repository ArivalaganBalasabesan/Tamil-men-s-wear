const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['Order', 'Promotion', 'System', 'Inventory'], default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
