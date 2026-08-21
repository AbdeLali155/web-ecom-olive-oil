const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authToken');
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');

router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/', authenticateToken, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'firstName lastName email') // Populate user info if needed
      .sort({ orderDate: -1 }); // Sort by newest first

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// GET single order by ID (Admin only)
router.get('/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// PATCH update order status (Admin only)
router.patch('/:id/status', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    // Get the order first to check delivery method
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Define valid statuses based on delivery method
    let validStatuses;
    
    if (order.deliveryMethod === 'pickup') {
      validStatuses = [
        'awaiting_confirmation',
        'confirmed',
        'ready_for_pickup',
        'picked_up',
        'cancelled',
        'refunded'
      ];
    } else { // home delivery
      validStatuses = [
        'awaiting_confirmation',
        'confirmed',
        'pending_delivery',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded'
      ];
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status for ${order.deliveryMethod} delivery. Valid statuses: ${validStatuses.join(', ')}` 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email');

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
});
  
module.exports = router;
