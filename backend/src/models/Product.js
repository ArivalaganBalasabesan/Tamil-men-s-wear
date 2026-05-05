const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  sizeAvailable: [{ type: String }],
  stock: { type: Number, required: true },
  images: [{ type: String }],
  description: { type: String }
});

// Middleware to sync with Inventory collection
productSchema.post('save', async function(doc) {
  const Inventory = mongoose.model('Inventory');
  await Inventory.findOneAndUpdate(
    { product: doc._id },
    { stockLevel: doc.stock },
    { upsert: true }
  );
});

productSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    const Inventory = mongoose.model('Inventory');
    await Inventory.findOneAndUpdate(
      { product: doc._id },
      { stockLevel: doc.stock },
      { upsert: true }
    );
  }
});

module.exports = mongoose.model('Product', productSchema);
