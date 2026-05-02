const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = "mongodb://sabeshhsabeshh_db_user:milka2024@ac-qzljq1z-shard-00-00.scmwvnv.mongodb.net:27017,ac-qzljq1z-shard-00-01.scmwvnv.mongodb.net:27017,ac-qzljq1z-shard-00-02.scmwvnv.mongodb.net:27017/tamil_mens_wear?ssl=true&authSource=admin&retryWrites=true&w=majority";

console.log('Testing connection to shards...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ SUCCESS: Connected to Shards');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILURE:', err.message);
    process.exit(1);
  });
