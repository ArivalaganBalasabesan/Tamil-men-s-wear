const express = require('express');
const router = express.Router();
const Catalog = require('../models/Catalog');
const { protect } = require('../middleware/auth');

// Create Catalog (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, image, products, season } = req.body;
    const catalog = new Catalog({ title, description, image, products, season });
    await catalog.save();
    res.json(catalog);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get All Catalogs
router.get('/', async (req, res) => {
  try {
    const catalogs = await Catalog.find().populate('products');
    res.json(catalogs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
