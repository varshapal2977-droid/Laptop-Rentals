const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brits_rentals', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Models
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
    name: String,
    category: { type: String, enum: ['laptop', 'desktop', 'monitor', 'tablet', 'printer', 'server'] },
    brand: String,
    specifications: {
        processor: String,
        ram: String,
        storage: String,
        screen: String,
        graphics: String
    },
    rentalPrice: {
        daily: Number,
        weekly: Number,
        monthly: Number
    },
    images: [String],
    stock: { type: Number, default: 5 },
    available: { type: Boolean, default: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        rentalType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
        duration: Number,
        price: Number
    }],
    totalAmount: Number,
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'delivered', 'returned', 'cancelled'],
        default: 'pending'
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    kycDocuments: {
        idProof: String,
        addressProof: String
    },
    createdAt: { type: Date, default: Date.now },
    returnDate: Date
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'brits_secret_key');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, phone });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid password' });
        
        const token = jwt.sign(
            { _id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'brits_secret_key'
        );
        res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};
        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };
        
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Order Routes
app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
        const order = new Order({ ...req.body, userId: req.user._id });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
        const orders = await Order.find(query)
            .populate('products.productId')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Owner Info Route
app.get('/api/owner', (req, res) => {
    res.json({
        name: "Roop Singh Pal",
        company: "Brits - Your Technology Partner",
        phone: "+91 8800379050",
        email: "roopsinghpal54@gmail.com",
        address: "205, 2nd Floor, Aapka Bazar, Gurudwara Road, Gurgaon 122001, Haryana",
        gstNumber: "06AACCG0527D1Z8",
        workingHours: "Mon-Sat: 9:00 AM - 8:00 PM",
        established: "2015"
    });
});

// Contact Form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        // Here you can add email sending logic
        res.json({ message: 'Thank you for contacting us. We will get back to you soon!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));