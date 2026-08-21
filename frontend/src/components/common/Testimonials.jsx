import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Send, User, Mail } from 'lucide-react';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    quote: '',
    customerName: '',
    customerEmail: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://acceptable-bravery-production-302d.up.railway.app/api/testimonials');
        
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        
        const data = await response.json();
        setTestimonials(data);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err.message);
        // Fallback to default testimonials if API fails
        setTestimonials([
          {
            quote: "The best olive oil I've ever tasted. The flavor is incomparable!",
            customerName: "Fatima Z.",
            rating: 5
          },
          {
            quote: "My family has been using Lamtahri for generations. The quality never changes.",
            customerName: "Mehdi E.",
            rating: 5
          },
          {
            quote: "You can taste the care that goes into every bottle. Truly exceptional.",
            customerName: "Amina K.",
            rating: 5
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Navigation functions for carousel
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(nextTestimonial, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle star rating click
  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  // Submit testimonial
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quote.trim() || !formData.customerName.trim()) {
      setSubmitMessage('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // For demo purposes, we'll simulate a successful submission
        // In production, you'd either require login or allow anonymous submissions
        console.log('No auth token, simulating submission for demo');
      }

      const response = await fetch('https://acceptable-bravery-production-302d.up.railway.app/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage('Thank you! Your testimonial has been submitted and will be reviewed before publishing.');
        
        // Reset form
        setFormData({
          quote: '',
          customerName: '',
          customerEmail: '',
          rating: 5
        });
        
        // Hide form after successful submission
        setTimeout(() => {
          setShowForm(false);
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

  // Render star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Render interactive star rating for form
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
            index < formData.rating
              ? 'text-yellow-400 fill-current hover:text-yellow-500' 
              : 'text-gray-300 hover:text-gray-400'
          }`}
        />
      </button>
    ));
  };

  // Show full display name - UPDATED to show complete name
  const getDisplayName = (name) => {
    // Return the full name as is, just trimmed
    return name.trim();
  };

  if (loading) {
    return (
      <section className="py-16 bg-[#f8f5f0]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#4e4219] mb-12">
            What Our Customers Say
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8a7233]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials.length) {
    return (
      <section className="py-16 bg-[#f8f5f0]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#4e4219] mb-12">
            What Our Customers Say
          </h2>
          <div className="text-center text-[#6c5a26]">
            <p>No testimonials available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#f8f5f0]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#4e4219] mb-8">
          What Our Customers Say
        </h2>
        
        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div key={testimonial._id || index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <Quote className="w-6 h-6 text-[#8a7233] mr-2" />
                <div className="flex space-x-1">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              
              <p className="text-[#6c5a26] italic mb-4 line-clamp-4">
                "{testimonial.quote}"
              </p>
              
              <div className="border-t border-[#d8c9a0] pt-4">
                <p className="font-semibold text-[#4e4219]">
                  {getDisplayName(testimonial.customerName)}
                </p>
                {testimonial.productName && (
                  <p className="text-sm text-[#8a7233]">
                    Verified Purchase: {testimonial.productName}
                  </p>
                )}
                {testimonial.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(testimonial.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden relative mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm mx-4">
            <div className="flex items-center mb-4">
              <Quote className="w-6 h-6 text-[#8a7233] mr-2" />
              <div className="flex space-x-1">
                {renderStars(testimonials[currentIndex].rating)}
              </div>
            </div>
            
            <p className="text-[#6c5a26] italic mb-4">
              "{testimonials[currentIndex].quote}"
            </p>
            
            <div className="border-t border-[#d8c9a0] pt-4">
              <p className="font-semibold text-[#4e4219]">
                {getDisplayName(testimonials[currentIndex].customerName)}
              </p>
              {testimonials[currentIndex].productName && (
                <p className="text-sm text-[#8a7233]">
                  Verified Purchase: {testimonials[currentIndex].productName}
                </p>
              )}
              {testimonials[currentIndex].createdAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(testimonials[currentIndex].createdAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>

          {/* Navigation arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-[#8a7233]" />
              </button>
              
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-[#8a7233]" />
              </button>
            </>
          )}

          {/* Indicators */}
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex 
                      ? 'bg-[#8a7233]' 
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View More Button */}
        {testimonials.length > 6 && (
          <div className="text-center">
            <button className="bg-[#8a7233] hover:bg-[#6c5a26] text-white px-6 py-3 rounded-lg font-medium transition-colors">
              View More Reviews
            </button>
          </div>
        )}

        {error && (
          <div className="text-center mt-4">
            <p className="text-sm text-red-600">
              {error} - Showing default testimonials
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;