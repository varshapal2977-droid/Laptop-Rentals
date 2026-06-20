const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Laptop', 'Desktop', 'Monitor', 'Tablet', 'MacBook', 'All-in-One', 'Peripherals']
  },
  brand: { type: String, required: true },
  specifications: {
    processor: String,
    ram: String,
    storage: String,
    display: String,
    graphics: String
  },
  rentalPrice: {
    daily: Number,
    weekly: Number,
    monthly: Number
  },
  images: [String],
  description: String,
  stock: { type: Number, default: 5 },
  available: { type: Boolean, default: true },
  location: { type: String, default: 'Gurgaon' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);