const express = require('express');
const router = express.Router();
const outfitController = require('../controllers/outfitController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, outfitController.getMyOutfits);
router.get('/public', outfitController.getPublicOutfits);
router.post('/', protect, outfitController.createOutfit);
router.delete('/:id', protect, outfitController.deleteOutfit);

module.exports = router;
