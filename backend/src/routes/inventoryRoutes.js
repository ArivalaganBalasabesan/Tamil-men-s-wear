const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, inventoryController.getInventory);
router.get('/low-stock', protect, inventoryController.getLowStockAlerts);
router.post('/update', protect, inventoryController.updateStock);

module.exports = router;
