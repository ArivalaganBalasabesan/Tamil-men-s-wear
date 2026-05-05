const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promotionController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, promoController.getPromotions);
router.post('/', protect, admin, promoController.createPromotion);
router.put('/:id', protect, admin, promoController.updatePromotion);
router.delete('/:id', protect, admin, promoController.deletePromotion);

module.exports = router;
