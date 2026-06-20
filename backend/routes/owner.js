const express = require('express');
const router = express.Router();
const Owner = require('../models/Owner');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'owner-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Initialize owner data if not exists
router.post('/init', async (req, res) => {
  try {
    let owner = await Owner.findOne();
    if (!owner) {
      owner = new Owner();
      await owner.save();
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get owner details
router.get('/', async (req, res) => {
  try {
    let owner = await Owner.findOne();
    if (!owner) {
      owner = await new Owner().save();
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update owner details
router.put('/', upload.single('photo'), async (req, res) => {
  try {
    const updateData = req.body;
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }
    
    let owner = await Owner.findOneAndUpdate({}, updateData, { new: true, upsert: true });
    res.json(owner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const recentOrders = await Order.find()
      .populate('products.product')
      .sort({ orderDate: -1 })
      .limit(5);
    
    res.json({
      stats: { totalOrders, totalProducts, pendingOrders },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;