const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, inventoryController.getInventory);
router.get('/low-stock', protect, admin, inventoryController.getLowStockAlerts);
router.post('/update', protect, admin, inventoryController.updateStock);

module.exports = router;
