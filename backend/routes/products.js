const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/authToken');
const adminAuth = require('../middleware/adminAuth');

// Upload single image
router.post('/upload', authenticateToken, adminAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
    res.json({ 
      imageUrl: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ msg: 'Upload failed', error: error.message });
  }
});

// Upload multiple images
router.post('/upload-multiple', authenticateToken, adminAuth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));

    res.json({ images: imageUrls });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ msg: 'Upload failed', error: error.message });
  }
});

// Create a new product
router.post('/', authenticateToken, adminAuth, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Produit introuvable' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// Update a product
router.put('/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ msg: 'Produit introuvable' });
    }
    
    res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// Delete a product
router.delete('/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Produit introuvable' });
    }

    // Delete associated image files
    const deleteImageFile = (imagePath) => {
      if (imagePath) {
        const filename = path.basename(imagePath);
        const filePath = path.join(__dirname, '../uploads/products', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted image file: ${filename}`);
        }
      }
    };

    // Delete main image
    if (product.image) {
      deleteImageFile(product.image);
    }

    // Delete additional images
    if (product.images && product.images.length > 0) {
      product.images.forEach(deleteImageFile);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Produit supprimé avec succès' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// Delete an image file
router.delete('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/products', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ msg: 'Image supprimée avec succès' });
    } else {
      res.status(404).json({ msg: 'Image introuvable' });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ msg: 'Erreur lors de la suppression', error: error.message });
  }
});

module.exports = router;