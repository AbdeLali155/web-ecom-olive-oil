// middleware/adminAuth.js
const User = require('../models/User'); // Adjust path to your User model

const adminAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated (assumes auth middleware was called first)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'Access denied. Authentication required.' 
      });
    }

    // Get user from database to check admin status
    const user = await User.findById(req.user.id).select('isAdmin');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found.' 
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authorization.' 
    });
  }
};

module.exports = adminAuth;