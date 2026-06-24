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
