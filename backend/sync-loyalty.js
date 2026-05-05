const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const UserSchema = new mongoose.Schema({
    loyaltyPoints: Number,
    name: String
});
const User = mongoose.model('User', UserSchema);

const LTSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    points: Number,
    type: String,
    description: String
}, { timestamps: true });
const LT = mongoose.model('LoyaltyTransaction', LTSchema);

async function sync() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({ loyaltyPoints: { $gt: 0 } });
        console.log(`Found ${users.length} users with points.`);

        for (const u of users) {
            // Check if they already have transactions
            const txCount = await LT.countDocuments({ user: u._id });
            if (txCount === 0) {
                await new LT({
                    user: u._id,
                    points: u.loyaltyPoints,
                    type: 'Earned',
                    description: 'Initial point balance migration'
                }).save();
                console.log(`✅ Migrated ${u.loyaltyPoints} points for ${u.name}`);
            } else {
                console.log(`⏩ ${u.name} already has transaction history.`);
            }
        }
        console.log('Sync complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

sync();
