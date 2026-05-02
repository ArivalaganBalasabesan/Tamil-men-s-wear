const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Attempting to connect with:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILURE:', err.message);
    if (err.message.includes('auth')) {
        console.log('Suggestion: Check your username and password.');
    }
    process.exit(1);
  });
