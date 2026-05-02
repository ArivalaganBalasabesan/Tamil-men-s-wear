const express = require('express');
const router = express.Router();
const wardrobeController = require('../controllers/wardrobeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, wardrobeController.getWardrobe);
router.post('/add', protect, wardrobeController.addToWardrobe);

module.exports = router;
