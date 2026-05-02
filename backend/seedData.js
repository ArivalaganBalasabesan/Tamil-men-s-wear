const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Inventory = require('./models/Inventory');

dotenv.config();

const categories = [
  { name: 'Traditional', description: 'Premium Silk Veshti & Sattai', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=300' },
  { name: 'Wedding', description: 'Luxury Suits & Sherwanis', image: 'https://images.unsplash.com/photo-1594932224828-b4b0573fe99c?q=80&w=300' },
  { name: 'Office', description: 'Sharp Formal Wear', image: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?q=80&w=300' },
  { name: 'Casual', description: 'Premium Everyday Style', image: 'https://images.unsplash.com/photo-1516257984877-283b9281c546?q=80&w=300' }
];

const products = [
  {
    name: 'தமிழ் Premium Gold Border Veshti',
    price: 2499,
    description: 'Traditional silk blend veshti with 100% pure gold zari border.',
    category: 'Traditional',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1617130608977-063e2c6e9424?q=80&w=600'],
    sizeAvailable: ['Free Size']
  },
  {
    name: 'Midnight Black Wedding Suit',
    price: 8999,
    description: 'Slim fit luxury tuxedo for the perfect wedding evening.',
    category: 'Wedding',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=600'],
    sizeAvailable: ['S', 'M', 'L', 'XL']
  },
  {
    name: 'Oxford White Formal Shirt',
    price: 1599,
    description: 'Cotton rich non-iron formal shirt for office excellence.',
    category: 'Office',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1621072156002-e2fcced0b170?q=80&w=600'],
    sizeAvailable: ['M', 'L', 'XL']
  },
  {
    name: 'Indigo Slim Fit Denim',
    price: 2199,
    description: 'Stretchable premium denim for ultimate comfort.',
    category: 'Casual',
    stock: 75,
    images: ['https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=600'],
    sizeAvailable: ['30', '32', '34', '36']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database...');

    // Clear existing
    await Category.deleteMany();
    await Product.deleteMany();
    await Inventory.deleteMany();

    // Seed Categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories seeded!');

    // Seed Products & Link Inventory
    for (let p of products) {
      const product = await Product.create(p);
      await Inventory.create({
        product: product._id,
        stockLevel: p.stock,
        lowStockThreshold: 10
      });
    }

    console.log('Products & Inventory seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
