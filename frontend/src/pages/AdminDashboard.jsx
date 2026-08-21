import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit2, X, RefreshCw, AlertTriangle, Check, ArrowLeft, Star, Trash2, CheckCircle, MessageSquare, Package } from 'lucide-react';

const BackToHome = ({ className = "" }) => {
  return (
    <a 
      href="/" 
      className={`inline-flex items-center text-[#6c5a26] hover:text-[#8a7233] transition-colors duration-200 text-sm font-medium ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to home
    </a>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'reviews'
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Common State
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);

  // Base API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://acceptable-bravery-production-302d.up.railway.app/api';

  // Fetch data on component mount and tab change
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchReviews();
    }
  }, [activeTab]);

  // Orders Functions
  const fetchOrders = async () => {
    setFetchingData(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const transformedOrders = data.map(order => ({
        id: order._id,
        customerName: order.customer.name,
        customerEmail: order.customer.email || 'N/A',
        customerPhone: order.customer.phone,
        customerAddress: order.customer.address || '',
        customerCity: order.customer.city || '',
        customerPostalCode: order.customer.postalCode || '',
        date: order.orderDate,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
      deliveryMethod: order.deliveryMethod,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        items: order.items,
        notes: order.notes || '',
        userId: order.userId
      }));

      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } finally {
      setFetchingData(false);
    }
  };

  // Reviews Functions
  const fetchReviews = async () => {
    setFetchingData(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/testimonials/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message);
    } finally {
      setFetchingData(false);
    }
  };

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  // Filter reviews
  useEffect(() => {
    let filtered = reviews;

    if (reviewSearchTerm) {
      filtered = filtered.filter(review =>
        review.customerName.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
        review.quote.toLowerCase().includes(reviewSearchTerm.toLowerCase())
      );
    }

    if (reviewStatusFilter !== 'all') {
      if (reviewStatusFilter === 'approved') {
        filtered = filtered.filter(review => review.isApproved === true);
      } else if (reviewStatusFilter === 'pending') {
        filtered = filtered.filter(review => review.isApproved === false);
      }
    }

    setFilteredReviews(filtered);
  }, [reviewSearchTerm, reviewStatusFilter, reviews]);

  // Review Management Functions
  const approveReview = async (reviewId) => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/testimonials/${reviewId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the reviews in state
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId ? { ...review, isApproved: true, approvedAt: new Date().toISOString() } : review
        )
      );
      
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/testimonials/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove the review from state
      setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get valid statuses based on delivery method
  const getValidStatuses = (deliveryMethod) => {
    if (deliveryMethod === 'pickup') {
      return ['awaiting_confirmation', 'confirmed', 'ready_for_pickup', 'picked_up'];
    } else {
      return ['awaiting_confirmation', 'confirmed', 'pending_delivery', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
    }
  };

  // Helper function to get next valid status
  const getNextValidStatus = (currentStatus, deliveryMethod) => {
    const validStatuses = getValidStatuses(deliveryMethod);
    const currentIndex = validStatuses.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex === validStatuses.length - 1) {
      return null; // No next status or invalid current status
    }
    
    return validStatuses[currentIndex + 1];
  };

  // Order Management Functions
  const getStatusColor = (status) => {
    const colors = {
      awaiting_confirmation: 'bg-orange-100 text-orange-800 border-orange-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      ready_for_pickup: 'bg-purple-100 text-purple-800 border-purple-200',
      picked_up: 'bg-green-100 text-green-800 border-green-200',
      pending_delivery: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      out_for_delivery: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.awaiting_confirmation;
  };

  const getStatusDisplayName = (status) => {
    const names = {
      awaiting_confirmation: 'Awaiting Confirmation',
      confirmed: 'Confirmed',
      ready_for_pickup: 'Ready for Pickup',
      picked_up: 'Picked Up',
      pending_delivery: 'Pending Delivery',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return names[status] || status;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const refreshData = () => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchReviews();
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6c5a26] mx-auto mb-4"></div>
          <p className="text-[#6c5a26]">Loading {activeTab}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading {activeTab}: {error}</p>
          <button
            onClick={refreshData}
            className="bg-[#6c5a26] hover:bg-[#8a7233] text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome className="mb-6" />

        {/* Header with Tab Navigation */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#4e4219] mb-2">Admin Dashboard</h1>
              <p className="text-[#6c5a26]">Manage orders and customer reviews</p>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center bg-[#6c5a26] hover:bg-[#8a7233] text-white px-4 py-2 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-[#e8ddc5] w-fit">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#6c5a26] text-white'
                  : 'text-[#6c5a26] hover:text-[#8a7233] hover:bg-[#f8f5f0]'
              }`}
            >
              <Package className="w-5 h-5 mr-2" />
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-[#6c5a26] text-white'
                  : 'text-[#6c5a26] hover:text-[#8a7233] hover:bg-[#f8f5f0]'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Reviews ({reviews.length})
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <>
            {/* Orders Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e8ddc5] p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6c5a26] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#e8ddc5] rounded-md focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6c5a26] w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-[#e8ddc5] rounded-md focus:ring-2 focus:ring-[#8a7233] focus:border-transparent bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="awaiting_confirmation">Awaiting Confirmation</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="pending_delivery">Pending Delivery</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e8ddc5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e8ddc5]">
                  <thead className="bg-[#f8f5f0]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#e8ddc5]">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#f8f5f0] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#4e4219]">
                          {order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-[#4e4219]">{order.customerName}</div>
                            <div className="text-sm text-[#6c5a26]">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6c5a26]">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.deliveryMethod === 'pickup' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusDisplayName(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#4e4219]">
                          {order.total.toFixed(2)} DH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                            className="text-[#8a7233] hover:text-[#6c5a26] transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-[#6c5a26]">No orders found matching your criteria.</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Reviews Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e8ddc5] p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6c5a26] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by customer name or review content..."
                    value={reviewSearchTerm}
                    onChange={(e) => setReviewSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#e8ddc5] rounded-md focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6c5a26] w-4 h-4" />
                  <select
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-[#e8ddc5] rounded-md focus:ring-2 focus:ring-[#8a7233] focus:border-transparent bg-white"
                  >
                    <option value="all">All Reviews</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e8ddc5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e8ddc5]">
                  <thead className="bg-[#f8f5f0]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4e4219] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#e8ddc5]">
                    {filteredReviews.map((review) => (
                      <tr key={review._id} className="hover:bg-[#f8f5f0] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-[#4e4219]">{review.customerName}</div>
                            {review.customerEmail && (
                              <div className="text-sm text-[#6c5a26]">{review.customerEmail}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {renderStars(review.rating)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6c5a26] max-w-xs truncate" title={review.quote}>
                            "{review.quote}"
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6c5a26]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.isApproved 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {review.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setIsReviewModalOpen(true);
                              }}
                              className="text-[#8a7233] hover:text-[#6c5a26] transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!review.isApproved && (
                              <button
                                onClick={() => approveReview(review._id)}
                                disabled={isLoading}
                                className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                                title="Approve Review"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteReview(review._id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                              title="Delete Review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredReviews.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-[#6c5a26]">No reviews found matching your criteria.</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Review Details Modal */}
        {isReviewModalOpen && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-[#6c5a26] h-3 w-full rounded-t-lg"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#4e4219] mb-2">Review Details</h2>
                    <p className="text-[#6c5a26]">Submitted by {selectedReview.customerName}</p>
                  </div>
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    className="text-[#6c5a26] hover:text-[#4e4219] transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-[#f8f5f0] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedReview.customerName}</p>
                      {selectedReview.customerEmail && (
                        <p><span className="font-medium">Email:</span> {selectedReview.customerEmail}</p>
                      )}
                      <p><span className="font-medium">Submitted:</span> {new Date(selectedReview.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="bg-[#f8f5f0] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Review Content</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Rating:</span>
                        <div className="flex space-x-1 mt-1">
                          {renderStars(selectedReview.rating)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Review:</span>
                        <p className="mt-1 text-[#6c5a26] italic">"{selectedReview.quote}"</p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedReview.isApproved 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {selectedReview.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-[#f8f5f0] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Actions</h3>
                    <div className="flex space-x-3">
                      {!selectedReview.isApproved && (
                        <button
                          onClick={() => {
                            approveReview(selectedReview._id);
                            setIsReviewModalOpen(false);
                          }}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve Review</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          deleteReview(selectedReview._id);
                          setIsReviewModalOpen(false);
                        }}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Review</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    className="bg-[#6c5a26] hover:bg-[#8a7233] text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {isOrderModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-[#6c5a26] h-3 w-full rounded-t-lg"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#4e4219] mb-2">Order Details</h2>
                    <p className="text-[#6c5a26]">Order ID: {selectedOrder.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="text-[#6c5a26] hover:text-[#4e4219] transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="bg-[#f8f5f0] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                      {selectedOrder.deliveryMethod === 'home' && (
                        <p><span className="font-medium">Address:</span> {selectedOrder.customerAddress}{selectedOrder.customerCity ? `, ${selectedOrder.customerCity}` : ''}{selectedOrder.customerPostalCode ? ` ${selectedOrder.customerPostalCode}` : ''}</p>
                      )}
                      <p><span className="font-medium">Delivery Method:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          selectedOrder.deliveryMethod === 'home' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                         {selectedOrder.deliveryMethod === 'home' ? 'Home Delivery' : 'Pickup'}
                        </span>
                      </p>
                      <p><span className="font-medium">Payment Method:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          selectedOrder.paymentMethod === 'bank_transfer'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}
                        </span>
                      </p>
                      {selectedOrder.paymentMethod === 'bank_transfer' && (
                        <p><span className="font-medium">Payment Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            selectedOrder.paymentStatus === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedOrder.paymentStatus === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-[#f8f5f0] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Order Date:</span> {new Date(selectedOrder.date).toLocaleDateString()}</p>
                      <p><span className="font-medium">Subtotal:</span> {selectedOrder.subtotal?.toFixed(2) || 'N/A'} DH</p>
                      <p><span className="font-medium">Delivery Fee:</span> {selectedOrder.deliveryFee?.toFixed(2) || '0.00'} DH</p>
                      <p><span className="font-medium text-lg">Total:</span> <span className="text-lg font-bold">{selectedOrder.total.toFixed(2)} DH</span></p>
                      <p><span className="font-medium">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusDisplayName(selectedOrder.status)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="lg:col-span-2 bg-[#f8f5f0] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Order Items</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#e8ddc5]">
                            <th className="text-left py-2">Product</th>
                            <th className="text-center py-2">Quantity</th>
                            <th className="text-right py-2">Unit Price</th>
                            <th className="text-right py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index} className="border-b border-[#e8ddc5]">
                              <td className="py-2">{item.name}</td>
                              <td className="text-center py-2">{item.quantity}</td>
                              <td className="text-right py-2">{item.price.toFixed(2)} DH</td>
                              <td className="text-right py-2">{(item.price * item.quantity).toFixed(2)} DH</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Status Management - Updated for pickup logic */}
                  <div className="lg:col-span-2 bg-[#f8f5f0] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.deliveryMethod === 'pickup' ? (
                        // Pickup order logic
                        <>
                          {selectedOrder.status === 'awaiting_confirmation' && (
                            <button
                              onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                              disabled={isLoading}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                              {isLoading ? 'Updating...' : 'Confirm Order'}
                            </button>
                          )}
                          
                          {selectedOrder.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(selectedOrder.id, 'ready_for_pickup')}
                              disabled={isLoading}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                              {isLoading ? 'Updating...' : 'Mark Ready for Pickup'}
                            </button>
                          )}
                          
                          {selectedOrder.status === 'ready_for_pickup' && (
                            <button
                              onClick={() => updateOrderStatus(selectedOrder.id, 'picked_up')}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                              {isLoading ? 'Updating...' : 'Mark as Picked Up'}
                            </button>
                          )}
                        </>
                      ) : (
                        // Delivery order logic
                        <>
                          {selectedOrder.status === 'awaiting_confirmation' && (
                            <button
                              onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                              disabled={isLoading}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                              {isLoading ? 'Updating...' : 'Confirm Order'}
                            </button>
                          )}
                          
                          {selectedOrder.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(selectedOrder.id, 'pending_delivery')}
                              disabled={isLoading}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                              {isLoading ? 'Updating...' : 'Mark Pending Delivery'}
                            </button>
                          )}
                          
                          {selectedOrder.status === 'pending_delivery' && (
                            <button
                              onClick={() => updateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                              disabled={isLoading}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                              {isLoading ? 'Updating...' : 'Mark Out for Delivery'}
                            </button>
                          )}
                          
                          {selectedOrder.status === 'out_for_delivery' && (
                            <button
                              onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                              {isLoading ? 'Updating...' : 'Mark as Delivered'}
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Cancel button (available for both pickup and delivery, but not for final states) */}
                      {!['cancelled', 'refunded', 'delivered', 'picked_up'].includes(selectedOrder.status) && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="lg:col-span-2 bg-[#f8f5f0] rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Customer Notes</h3>
                      <p className="text-[#6c5a26]">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="bg-[#6c5a26] hover:bg-[#8a7233] text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;