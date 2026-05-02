const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// Create Review
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = new Review({ productId, userId: req.user.id, rating, comment });
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get Reviews for Product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
