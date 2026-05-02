const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { protect, admin } = require('../middleware/auth');

router.get('/', promotionController.getPromotions);
router.get('/validate/:code', promotionController.validatePromoCode);
router.get('/all', protect, admin, promotionController.getAllPromotions);
router.post('/', protect, admin, promotionController.createPromotion);
router.put('/:id', protect, admin, promotionController.updatePromotion);
router.delete('/:id', protect, admin, promotionController.deletePromotion);

module.exports = router;
