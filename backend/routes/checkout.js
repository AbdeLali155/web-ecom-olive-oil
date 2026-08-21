const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authToken');

router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Authenticated user ID:', req.user.id);
    const {
      items,
      subtotal,
      deliveryFee,
      total,
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

    const order = new Order({
      userId: req.user.id,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod,
      paymentMethod,
      notes,
      customer
    });

    await order.save();
    res.status(201).json({ message: 'Order created', orderId: order._id });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Error creating order' });
  }
});

module.exports = router;
