import React, { useState, useEffect } from "react";
import { Star, Send, MessageSquare, X, Quote } from 'lucide-react';

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [testimonialData, setTestimonialData] = useState({
    customerName: '',
    customerEmail: '',
    quote: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Load user info when modal opens
  useEffect(() => {
    if (showModal) {
      loadUserInfo();
    }
  }, [showModal]);

  // Function to load user information
  const loadUserInfo = () => {
    // Method 1: Try to get user info from localStorage (if stored separately)
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      const userInfo = JSON.parse(savedUser);
      console.log('Loading user info from localStorage:', userInfo);
      setTestimonialData(prev => ({
        ...prev,
        customerName: userInfo.fullName || userInfo.name || 
                     (userInfo.firstName && userInfo.lastName ? 
                      `${userInfo.firstName} ${userInfo.lastName}` : ''),
        customerEmail: userInfo.email || ''
      }));
      
      // If some info is missing, still try API to get complete profile
      if (!userInfo.fullName && (!userInfo.firstName || !userInfo.lastName)) {
        fetchUserInfoFromAPI();
      }
      return;
    }

    // Method 2: Try to decode JWT token to get user info
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Decode JWT payload (Note: This is just reading, not verifying)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Loading user info from JWT:', payload);
        
        // Set what we can from JWT
        setTestimonialData(prev => ({
          ...prev,
          customerName: payload.fullName || payload.name || 
                       (payload.firstName && payload.lastName ? 
                        `${payload.firstName} ${payload.lastName}` : ''),
          customerEmail: payload.email || ''
        }));
        
        // Always fetch from API to get complete profile if needed
        fetchUserInfoFromAPI();
        return;
      } catch (error) {
        console.log('Could not decode token for user info');
      }
    }

    // Method 3: Fetch user info from API
    fetchUserInfoFromAPI();
  };

  // Function to fetch user info from API
  const fetchUserInfoFromAPI = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('https://acceptable-bravery-production-302d.up.railway.app/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userInfo = await response.json();
        console.log('Loading user info from API:', userInfo);
        
        setTestimonialData(prev => ({
          ...prev,
          customerName: userInfo.fullName || userInfo.name || 
                       (userInfo.firstName && userInfo.lastName ? 
                        `${userInfo.firstName} ${userInfo.lastName}` : prev.customerName),
          customerEmail: userInfo.email || prev.customerEmail
        }));
        
        console.log('Updated review modal with user info');
      }
    } catch (error) {
      console.log('Could not fetch user info from API:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestimonialData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStarClick = (rating) => {
    setTestimonialData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!testimonialData.quote.trim() || !testimonialData.customerName.trim()) {
      setSubmitMessage('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://acceptable-bravery-production-302d.up.railway.app/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(testimonialData)
      });

      if (response.ok) {
        setSubmitMessage('Thank you! Your testimonial has been submitted and will be reviewed before publishing.');
        
        // Reset form
        setTestimonialData({
          customerName: '',
          customerEmail: '',
          quote: '',
          rating: 5
        });
        
        // Close modal after 3 seconds
        setTimeout(() => {
          setShowModal(false);
          setSubmitMessage('');
        }, 3000);
        
      } else {
        const errorData = await response.json();
        setSubmitMessage(errorData.message || 'Failed to submit testimonial. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      setSubmitMessage('There was an error submitting your testimonial. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitMessage('');
    setTestimonialData({
      customerName: '',
      customerEmail: '',
      quote: '',
      rating: 5
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const renderRatingInput = () => {
    return [...Array(5)].map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => handleStarClick(index + 1)}
        className="focus:outline-none"
      >
        <Star
          className={`w-6 h-6 transition-colors ${
            index < testimonialData.rating
              ? 'text-yellow-400 fill-current hover:text-yellow-500' 
              : 'text-gray-300 hover:text-gray-400'
          }`}
        />
      </button>
    ));
  };

  return (
    <>
      <footer className="bg-[#4e4219] text-[#f0e9d8] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b border-[#8a7233] pb-2">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="hover:text-[#c0a968] transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-[#c0a968] transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="/products" className="hover:text-[#c0a968] transition-colors">
                    Products
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-[#c0a968] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b border-[#8a7233] pb-2">Contact Us</h3>
              <address className="not-italic space-y-3">
                <p className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 text-[#c0a968]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>123 Olive Grove, Errachidia, Morocco</span>
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#c0a968]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+212 6 12 34 56 78</span>
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#c0a968]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>contact@lamtahri-freres.com</span>
                </p>
              </address>
            </div>

            {/* Business Hours */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b border-[#8a7233] pb-2">Business Hours</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Share Review Button Section */}
          <div className="mt-12 text-center">
            <div className="bg-[#6c5a26] rounded-lg p-6 max-w-md mx-auto">
              <h4 className="text-lg font-bold mb-3">Love Our Olive Oil?</h4>
              <p className="text-sm mb-4 text-[#f0e9d8]">
                Share your experience and help other customers discover the quality of our products!
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#8a7233] hover:bg-[#c0a968] text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Share Your Review</span>
              </button>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-12 flex justify-center space-x-6">
            <a href="#" aria-label="Facebook" className="text-[#f0e9d8] hover:text-[#c0a968] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="text-[#f0e9d8] hover:text-[#c0a968] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="text-[#f0e9d8] hover:text-[#c0a968] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-[#8a7233] text-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} Lamtahri Frères. All rights reserved.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
              <a href="/privacy" className="text-sm hover:text-[#c0a968] transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm hover:text-[#c0a968] transition-colors">
                Terms of Service
              </a>
              <a href="/shipping" className="text-sm hover:text-[#c0a968] transition-colors">
                Shipping Policy
              </a>
              <a href="/returns" className="text-sm hover:text-[#c0a968] transition-colors">
                Returns & Refunds
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Review Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Quote className="w-6 h-6 text-[#8a7233] mr-3" />
                <h2 className="text-2xl font-bold text-[#4e4219]">Share Your Experience</h2>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[#6c5a26] mb-6">
                We'd love to hear about your experience with our olive oil! Your honest feedback helps other customers and helps us improve our products.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#4e4219] mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={testimonialData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4e4219] mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={testimonialData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4e4219] mb-2">
                    Rating *
                  </label>
                  <div className="flex space-x-1 mb-2">
                    {renderRatingInput()}
                  </div>
                  <p className="text-sm text-[#6c5a26]">
                    Click the stars to rate your experience
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4e4219] mb-2">
                    Your Review *
                  </label>
                  <textarea
                    name="quote"
                    value={testimonialData.quote}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    placeholder="Tell us about your experience with our olive oil..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent resize-none"
                    maxLength="500"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-[#6c5a26]">
                      Share your honest experience to help other customers
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonialData.quote.length}/500
                    </p>
                  </div>
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-lg ${
                    submitMessage.includes('Thank you') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !testimonialData.quote.trim() || !testimonialData.customerName.trim()}
                    className="flex-1 bg-[#6c5a26] hover:bg-[#8a7233] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Your review will be reviewed before being published on our website.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;