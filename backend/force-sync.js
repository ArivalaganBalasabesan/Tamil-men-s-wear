const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const InventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  stockLevel: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  lastRestocked: { type: Date, default: Date.now }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  stock: Number
});

const Inventory = mongoose.model('Inventory', InventorySchema);
const Product = mongoose.model('Product', ProductSchema);

async function sync() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const products = await Product.find();
    console.log(`Found ${products.length} products`);
    
    const existingIds = await Inventory.find().distinct('product');
    const existingIdsStr = existingIds.map(id => id.toString());
    
    const missing = products.filter(p => !existingIdsStr.includes(p._id.toString()));
    console.log(`Found ${missing.length} missing inventory records`);
    
    if (missing.length > 0) {
      const records = missing.map(p => ({
        product: p._id,
        stockLevel: p.stock || 0,
        lowStockThreshold: 10
      }));
      await Inventory.insertMany(records);
      console.log('Successfully created records');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

sync();
