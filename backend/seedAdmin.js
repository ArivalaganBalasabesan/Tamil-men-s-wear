const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tmw.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin already exists, updating password...');
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(adminPass, salt);
      admin.role = 'admin';
      await admin.save();
    } else {
      console.log('Creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(adminPass, salt);
      admin = new User({
        name: 'Tamil Admin',
        email: adminEmail,
        password: hashedPass,
        role: 'admin'
      });
      await admin.save();
    }

    console.log('Admin seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
