const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authToken');

router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Authenticated user ID:', req.user.id);
    const {
      items,
      deliveryMethod,
      paymentMethod,
      notes,
      customer
    } = req.body;

    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ message: 'Customer name and phone required' });
    }

    if (!paymentMethod || !['cash', 'bank_transfer'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Valid payment method required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Recalculate everything server-side from real Product records.
    // Never trust price/subtotal/total sent by the client.
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: 'Each item must include a valid productId' });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      const quantity = Number(item.quantity) || 1;
      if (quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }

      const lineTotal = product.price * quantity;
      subtotal += lineTotal;

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        size: product.size,
        price: product.price, // real price from DB, not client input
        quantity,
        image: product.image
      });
    }

    // Delivery fee rule is enforced server-side too, not trusted from client.
    const deliveryFee = (deliveryMethod === 'home' && subtotal < 500) ? 50 : 0;
    const total = subtotal + deliveryFee;

    const order = new Order({
      userId: req.user.id,
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod,
      paymentMethod,
      notes,
      customer
    });

    await order.save();
    res.status(201).json({ message: 'Order created', orderId: order._id, total });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Error creating order' });
  }
});

module.exports = router;