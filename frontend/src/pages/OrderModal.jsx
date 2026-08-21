import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Package, CreditCard, Truck } from 'lucide-react';

const OrderModal = ({ product, quantity, onClose, cartItems, navigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryMethod: 'home',
    paymentMethod: 'cash',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user info when modal opens
  useEffect(() => {
    // Auto-fill user information
    const loadUserInfo = () => {
      // Method 1: Try to get user info from localStorage (if stored separately)
      const savedUser = localStorage.getItem('userInfo');
      if (savedUser) {
        const userInfo = JSON.parse(savedUser);
        console.log('Loading user info from localStorage:', userInfo);
        setFormData(prev => ({
          ...prev,
          fullName: userInfo.fullName || userInfo.name || 
                   (userInfo.firstName && userInfo.lastName ? 
                    `${userInfo.firstName} ${userInfo.lastName}` : ''),
          email: userInfo.email || '',
          phone: userInfo.phone || ''
        }));
        
        // If phone is missing, still try API to get complete profile
        if (!userInfo.phone) {
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
          setFormData(prev => ({
            ...prev,
            fullName: payload.fullName || payload.name || 
                     (payload.firstName && payload.lastName ? 
                      `${payload.firstName} ${payload.lastName}` : ''),
            email: payload.email || ''
          }));
          
          // Always fetch from API to get phone and other missing fields
          fetchUserInfoFromAPI();
          return;
        } catch (error) {
          console.log('Could not decode token for user info');
        }
      }

      // Method 3: Fetch user info from API
      fetchUserInfoFromAPI();
    };

    loadUserInfo();
  }, []);

  // Function to fetch user info from API
  const fetchUserInfoFromAPI = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userInfo = await response.json();
        console.log('Loading user info from API:', userInfo);
        
        setFormData(prev => ({
          ...prev,
          fullName: userInfo.fullName || userInfo.name || 
                   (userInfo.firstName && userInfo.lastName ? 
                    `${userInfo.firstName} ${userInfo.lastName}` : prev.fullName),
          email: userInfo.email || prev.email,
          phone: userInfo.phone || prev.phone
        }));
        
        console.log('Phone from API:', userInfo.phone);
      }
    } catch (error) {
      console.log('Could not fetch user info from API:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      if (name === 'deliveryMethod' && value === 'home') {
        return {
          ...prev,
          [name]: value,
          paymentMethod: 'cash'
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const calculateSubtotal = () => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    return product.price * quantity;
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 500 ? 0 : 50;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = formData.deliveryMethod === 'home' ? calculateDeliveryFee() : 0;
    return subtotal + deliveryFee;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        alert('You must be logged in to place an order.');
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        items: cartItems && cartItems.length > 0 ? cartItems : [{
          name: product.name,
          size: product.size,
          price: product.price,
          quantity: quantity,
          image: product.image
        }],
        subtotal: calculateSubtotal(),
        deliveryFee: formData.deliveryMethod === 'home' ? calculateDeliveryFee() : 0,
        total: calculateTotal(),
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || '',
        orderDate: new Date().toISOString()
      };

      console.log('Sending orderData:', orderData);

      const response = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order failed:', errorData);
        alert('Order failed: ' + errorData.message);
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      console.log('Order success:', result);

      localStorage.removeItem('cart');
      alert("Votre commande a été passée avec succès!");
      
      onClose();
      if (navigate) {
        navigate('/');
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = calculateDeliveryFee();
  const isFreeDelivery = subtotal >= 500 && formData.deliveryMethod === 'home';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#4e4219]">Place an Order</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6 bg-[#f8f5f0] border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#4e4219] mb-4">Order Summary</h3>
          
          {cartItems && cartItems.length > 0 ? (
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-[#4e4219]">{item.name}</h4>
                    <p className="text-[#6c5a26]">{item.size}</p>
                    <p className="text-[#8a7233] font-semibold">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#8a7233]">{formatPrice(item.price * item.quantity)} DH</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-[#4e4219]">{product.name}</h4>
                <p className="text-[#6c5a26]">{product.size}</p>
                <p className="text-[#8a7233] font-semibold">Quantity: {quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#8a7233]">{formatPrice(product.price * quantity)} DH</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Form */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#4e4219] mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6c5a26] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6c5a26] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#6c5a26] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div>
            <h3 className="text-lg font-semibold text-[#4e4219] mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Delivery Method
            </h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="home"
                  checked={formData.deliveryMethod === 'home'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-[#4e4219]">Home delivery</div>
                  <div className="text-sm text-[#6c5a26]">
                    {isFreeDelivery ? (
                      <span className="text-green-600">Delivery costs: Free (Order ≥ 500 DH)</span>
                    ) : (
                      `Delivery costs: 50 DH`
                    )}
                  </div>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input  
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={formData.deliveryMethod === 'pickup'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-[#4e4219]">In-store pickup</div>
                  <div className="text-sm text-[#6c5a26]">Free - Pick up within 24 h</div>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Address */}
          {formData.deliveryMethod === 'home' && (
            <div>
              <h3 className="text-lg font-semibold text-[#4e4219] mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Delivery address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6c5a26] mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required={formData.deliveryMethod === 'home'}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                    placeholder="Adresse complète avec numéro de rue..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6c5a26] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required={formData.deliveryMethod === 'home'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                      placeholder="Casablanca, Rabat..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6c5a26] mb-2">
                      Code Postal
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                      placeholder="20000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {formData.deliveryMethod === 'home' && (
            <div>
              <h3 className="text-lg font-semibold text-[#4e4219] mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#4e4219]">Payment on delivery</div>
                    <div className="text-sm text-[#6c5a26]">Cash or check</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#4e4219]">Bank transfer</div>
                    <div className="text-sm text-[#6c5a26]">Pay via bank transfer using our RIB</div>
                  </div>
                </label>
              </div>

              {formData.paymentMethod === 'bank_transfer' && (
                <div className="mt-4 p-4 bg-[#f8f5f0] border border-[#e8ddc5] rounded-lg">
                  <div className="text-sm font-medium text-[#4e4219] mb-1">Our RIB (bank account number):</div>
                  <div className="text-lg font-mono text-[#8a7233] tracking-wide">007780000123456789012345</div>
                  <div className="text-xs text-[#6c5a26] mt-2">Please make the transfer and mention your order number in the reference. Your order will be confirmed once we receive the payment.</div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#6c5a26] mb-2">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
              placeholder="Instructions spéciales pour la livraison..."
            />
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-[#4e4219]">Total to pay:</span>
              <span className="font-bold text-[#8a7233] text-xl">{formatPrice(calculateTotal())} DH</span>
            </div>
            {formData.deliveryMethod === 'home' && (
              <p className="text-sm text-[#6c5a26] mt-1">
                (Product: {formatPrice(subtotal)} DH + Delivery: {isFreeDelivery ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `${deliveryFee} DH`
                )})
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#8a7233] hover:bg-[#6c5a26] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending in progress...</span>
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  <span>Confirm Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;