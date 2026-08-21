// models/Testimonial.js
const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: [true, 'Quote is required'],
    trim: true,
    minlength: [10, 'Quote must be at least 10 characters long'],
    maxlength: [500, 'Quote cannot exceed 500 characters']
  },
  
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isApproved: {
    type: Boolean,
    default: false
  },
  
  approvedAt: {
    type: Date
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isVisible: {
    type: Boolean,
    default: true
  },
  
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' // Optional: if testimonial is for a specific product
  },
  
  helpfulVotes: {
    type: Number,
    default: 0
  },
  
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better performance
testimonialSchema.index({ isApproved: 1, createdAt: -1 });
testimonialSchema.index({ userId: 1 });
testimonialSchema.index({ rating: 1 });
testimonialSchema.index({ productId: 1 });

// Virtual for formatted customer name (first name + last initial)
testimonialSchema.virtual('displayName').get(function() {
  const nameParts = this.customerName.split(' ');
  if (nameParts.length === 1) {
    return nameParts[0];
  }
  const firstName = nameParts[0];
  const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
});

// Static method to get approved testimonials with pagination
testimonialSchema.statics.getApproved = function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    isApproved: true, 
    isVisible: true 
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .select('-userId -approvedBy -__v');
};

// Static method to get testimonials by rating
testimonialSchema.statics.getByRating = function(rating) {
  return this.find({ 
    rating,
    isApproved: true, 
    isVisible: true 
  })
  .sort({ createdAt: -1 })
  .select('-userId -approvedBy -__v');
};

// Instance method to approve testimonial
testimonialSchema.methods.approve = function(adminId) {
  this.isApproved = true;
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  return this.save();
};

// Pre-save middleware to validate rating
testimonialSchema.pre('save', function(next) {
  if (this.rating && (this.rating < 1 || this.rating > 5)) {
    next(new Error('Rating must be between 1 and 5'));
  }
  next();
});

// Export model
module.exports = mongoose.model('Testimonial', testimonialSchema);