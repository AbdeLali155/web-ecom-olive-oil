const express = require('express');
const Testimonial = require('../models/Testimonial');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authToken'); // JWT authentication middleware
const adminAuth = require('../middleware/adminAuth'); // Admin role check middleware

// @route   GET /api/testimonials
// @desc    Get all approved testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ 
      isApproved: true 
    }).sort({ 
      createdAt: -1 
    }).select('-__v');

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ 
      message: 'Server error while fetching testimonials' 
    });
  }
});

// @route   GET /api/testimonials/all
// @desc    Get all testimonials (including pending) - Admin only
// @access  Private (Admin)
router.get('/all', [auth, adminAuth], async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({ 
      message: 'Server error while fetching testimonials' 
    });
  }
});

// @route   POST /api/testimonials
// @desc    Create a new testimonial
// @access  Private (Authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { quote, rating, customerName, customerEmail } = req.body;

    // Validation
    if (!quote || !rating || !customerName) {
      return res.status(400).json({
        message: 'Quote, rating, and customer name are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    const testimonial = new Testimonial({
      quote: quote.trim(),
      rating,
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim(),
      userId: req.user.id, // From auth middleware
      isApproved: false // Requires admin approval
    });

    await testimonial.save();

    res.status(201).json({
      message: 'Testimonial submitted successfully. It will be reviewed before being published.',
      testimonial: {
        id: testimonial._id,
        quote: testimonial.quote,
        rating: testimonial.rating,
        customerName: testimonial.customerName,
        isApproved: testimonial.isApproved,
        createdAt: testimonial.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ 
      message: 'Server error while creating testimonial' 
    });
  }
});

// @route   PUT /api/testimonials/:id/approve
// @desc    Approve a testimonial
// @access  Private (Admin)
router.put('/:id/approve', [auth, adminAuth], async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ 
        message: 'Testimonial not found' 
      });
    }

    testimonial.isApproved = true;
    testimonial.approvedAt = new Date();
    testimonial.approvedBy = req.user.id;

    await testimonial.save();

    res.json({
      message: 'Testimonial approved successfully',
      testimonial
    });

  } catch (error) {
    console.error('Error approving testimonial:', error);
    res.status(500).json({ 
      message: 'Server error while approving testimonial' 
    });
  }
});

// @route   PUT /api/testimonials/:id
// @desc    Update a testimonial
// @access  Private (Admin or testimonial owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const { quote, rating, customerName } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ 
        message: 'Testimonial not found' 
      });
    }

    // Check if user is admin or testimonial owner
    const currentUser = await User.findById(req.user.id).select('isAdmin');
    if (testimonial.userId.toString() !== req.user.id && !currentUser?.isAdmin) {
      return res.status(403).json({ 
        message: 'Not authorized to update this testimonial' 
      });
    }

    // Update fields
    if (quote) testimonial.quote = quote.trim();
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: 'Rating must be between 1 and 5'
        });
      }
      testimonial.rating = rating;
    }
    if (customerName) testimonial.customerName = customerName.trim();

   // If non-admin user updates, reset approval status
  if (!currentUser?.isAdmin) {
    testimonial.isApproved = false;
    testimonial.approvedAt = null;
    testimonial.approvedBy = null;
  }

    testimonial.updatedAt = new Date();
    await testimonial.save();

    res.json({
      message: 'Testimonial updated successfully',
      testimonial
    });

  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ 
      message: 'Server error while updating testimonial' 
    });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete a testimonial
// @access  Private (Admin or testimonial owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ 
        message: 'Testimonial not found' 
      });
    }

    // Check if user is admin or testimonial owner
      const currentUser = await User.findById(req.user.id).select('isAdmin');
  if (testimonial.userId.toString() !== req.user.id && !currentUser?.isAdmin) {
    return res.status(403).json({
      message: 'Not authorized to delete this testimonial'
    });
  }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Testimonial deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ 
      message: 'Server error while deleting testimonial' 
    });
  }
});

// @route   GET /api/testimonials/stats
// @desc    Get testimonials statistics
// @access  Private (Admin)
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const stats = await Testimonial.aggregate([
      {
        $group: {
          _id: null,
          totalTestimonials: { $sum: 1 },
          approvedTestimonials: {
            $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] }
          },
          pendingTestimonials: {
            $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] }
          },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const result = stats[0] || {
      totalTestimonials: 0,
      approvedTestimonials: 0,
      pendingTestimonials: 0,
      averageRating: 0
    };

    res.json(result);

  } catch (error) {
    console.error('Error fetching testimonial stats:', error);
    res.status(500).json({ 
      message: 'Server error while fetching statistics' 
    });
  }
});

module.exports = router;
