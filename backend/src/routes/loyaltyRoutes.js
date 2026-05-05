const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, loyaltyController.getLoyaltyInfo);
router.get('/all', protect, admin, loyaltyController.getAllLoyalty);
router.post('/migrate', protect, admin, loyaltyController.migrateData);
router.post('/add', protect, loyaltyController.addPoints);
router.post('/adjust', protect, admin, loyaltyController.adminAdjustPoints);

module.exports = router;
