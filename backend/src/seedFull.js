const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Request = require('./models/Request');
const Wishlist = require('./models/Wishlist');
const Review = require('./models/Review');
const Cart = require('./models/Cart');

dotenv.config();

const seedFullDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database...');

    const users = await User.find();
    const products = await Product.find();

    if (users.length === 0 || products.length === 0) {
      console.error('Missing Users or Products. Run seedData.js and register a user first.');
      process.exit(1);
    }

    // Clear existing
    await Order.deleteMany();
    await Request.deleteMany();
    await Wishlist.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();

    for (let u of users) {
      console.log(`Seeding data for user: ${u.name}...`);
      
      // 1. Seed Orders
      await Order.create({
        userId: u._id,
        products: [
          { productId: products[0]._id, quantity: 1, price: products[0].price, size: 'M' },
          { productId: products[1]._id, quantity: 1, price: products[1].price, size: 'L' }
        ],
        totalAmount: products[0].price + products[1].price,
        paymentStatus: 'Completed',
        orderStatus: 'Delivered'
      });

      // 2. Seed Requests (Support)
      await Request.create({
        user: u._id,
        subject: 'General Inquiry',
        message: 'I love the new collection!',
        status: 'Pending',
        priority: 'Medium'
      });

      // 3. Seed Wishlist
      await Wishlist.create({ userId: u._id, productId: products[2]._id });

      // 4. Seed Reviews
      await Review.create({
        userId: u._id,
        productId: products[0]._id,
        rating: 5,
        comment: 'Excellent quality and fit!'
      });

      // 5. Seed Cart
      await Cart.create({ userId: u._id, productId: products[3]._id, quantity: 1 });
    }

    console.log('🚀 All users now have sample data!');

    console.log('🚀 All collections seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedFullDB();
