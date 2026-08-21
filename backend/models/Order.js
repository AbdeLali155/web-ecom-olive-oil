const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'home'],
    required: true
  },
 notes: String,
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending'
  },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String }
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: [
      'awaiting_confirmation',
      'confirmed',
      'ready_for_pickup',      // New status for pickup orders
      'picked_up',             // New status for completed pickup orders
      'pending_delivery',      // Only for home delivery
      'out_for_delivery',      // Only for home delivery
      'delivered',             // Only for home delivery
      'cancelled',
      'refunded'
    ],
    default: 'awaiting_confirmation'
  }
});

module.exports = mongoose.model('Order', orderSchema);