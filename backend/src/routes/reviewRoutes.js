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

// Get All Reviews (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete Review (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Review removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
