const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, loyaltyController.getLoyaltyInfo);
router.post('/add', protect, loyaltyController.addPoints);

module.exports = router;
