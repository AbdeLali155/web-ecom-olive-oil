const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const { Logtail } = require("@logtail/node");
dotenv.config();
const logtail = new Logtail("TLHYytVT9TEwm39rxZSFCbV1", {
  endpoint: "https://s2699047.eu-central-1a.betterstackdata.com"
});
const app = express();
app.use(cors({
  origin: 'https://web-ecom-olive-oil-sage.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  logtail.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

console.log("Connecting to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/user', require('./routes/user'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/testimonials', require('./routes/testimonials')); // Add testimonials routes


// Static file serving - ORDER MATTERS: More specific routes first
app.use('/uploads/products', express.static(path.join(__dirname, 'uploads/products')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Create required directories if they don't exist
const fs = require('fs');
const requiredDirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/products'),
    path.join(__dirname, 'assets')
];

requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Static files served from:`);
    console.log(`   - /uploads/products -> ${path.join(__dirname, 'uploads/products')}`);
    console.log(`   - /uploads -> ${path.join(__dirname, 'uploads')}`);
    console.log(`   - /assets -> ${path.join(__dirname, 'assets')}`);
});