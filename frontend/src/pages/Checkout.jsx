import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, User, MapPin, Truck, CreditCard, Package } from 'lucide-react';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryMethod: 'pickup', // 'pickup' or 'home'
paymentMethod: 'cash', // 'cash' or 'bank_transfer'    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Load cart items and user info from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Auto-fill user information
    const loadUserInfo = () => {
      // Method 1: Try to get user info from localStorage (if stored separately)
      const savedUser = localStorage.getItem('userInfo');
      if (savedUser) {
        const userInfo = JSON.parse(savedUser);
        console.log('Loading user info from localStorage:', userInfo);
        const newFormData = {
          ...formData,
          fullName: userInfo.fullName || userInfo.name || 
                   (userInfo.firstName && userInfo.lastName ? 
                    `${userInfo.firstName} ${userInfo.lastName}` : ''),
          email: userInfo.email || '',
          phone: userInfo.phone || ''
        };
        console.log('Updated form data:', newFormData);
        setFormData(newFormData);
        
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateSubtotal();
    // Free delivery if subtotal >= 500 DH
    return subtotal >= 500 ? 0 : 50;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = formData.deliveryMethod === 'home' ? calculateDeliveryFee() : 0;
    return subtotal + deliveryFee;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const token = localStorage.getItem('authToken'); // JWT from login

    if (!token) {
      alert('You must be logged in to place an order.');
      setIsSubmitting(false);
      return;
    }

   const orderData = {
      items: cartItems,
      subtotal: calculateSubtotal(),
      deliveryFee: formData.deliveryMethod === 'home' ? calculateDeliveryFee() : 0,
      total: calculateTotal(),
      customer: {
        name: formData.fullName,
        phone: formData.phone,
        address: formData.address
      },
      deliveryMethod: formData.deliveryMethod,
      paymentMethod: formData.deliveryMethod === 'pickup' ? 'cash' : formData.paymentMethod,
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

    // Clear cart and redirect
    localStorage.removeItem('cart');
    alert("Votre commande a été passée avec succès");
    navigate('/');
  } catch (err) {
    console.error('Checkout error:', err);
    setIsSubmitting(false);
  }
};


  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = calculateDeliveryFee();
  const isFreeDelivery = subtotal >= 500 && formData.deliveryMethod === 'home';

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-[#4e4219] mb-4">Votre panier est vide</h2>
          <p className="text-[#6c5a26] mb-6">Vous n'avez aucun produit dans votre panier.</p>
          <Link 
            to="/" 
            className="bg-[#6c5a26] hover:bg-[#8a7233] text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#4e4219]">Place the order</h1>
          <Link to="/" className="text-[#8a7233] hover:text-[#6c5a26] flex items-center">
            <X className="w-5 h-5 mr-1" />
            Cancel
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-[#4e4219] mb-6 border-b pb-2">Order Summary</h2>
            
            <ul className="divide-y divide-[#e8ddc5]">
              {cartItems.map((item) => (
                <li key={item.id} className="py-4 flex">
                  <div className="flex-shrink-0 w-20 h-20 border border-[#e8ddc5] rounded-md overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-[#4e4219]">{item.name}</h3>
                    <p className="text-sm text-[#6c5a26]">{item.variation}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-[#6c5a26]">Quantité: {item.quantity}</span>
                      <span className="font-bold text-[#8a7233]">{formatPrice(item.price)} DH</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-[#e8ddc5]">
              <div className="flex justify-between mb-2">
                <span className="text-[#6c5a26]">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)} DH</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-[#6c5a26]">Delivery</span>
                <span className="font-medium">
                  {formData.deliveryMethod === 'home' ? (
                    isFreeDelivery ? (
                      <span className="text-green-600">Free (Order ≥ 500 DH)</span>
                    ) : (
                      '50 DH'
                    )
                  ) : (
                    'Free'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#4e4219] mt-4 pt-4 border-t border-[#e8ddc5]">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())} DH</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#4e4219] mb-4 border-b pb-2 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal information
                </h2>
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
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#4e4219] mb-4 border-b pb-2 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Delivery method
                </h2>
                <div className="space-y-3">
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
                      <div className="text-sm text-[#6c5a26]">Free - Pick up within 24 hours</div>
                    </div>
                  </label>
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
                          'Delivery costs: 50 DH'
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Address - Only shown for home delivery */}
              {formData.deliveryMethod === 'home' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#4e4219] mb-4 border-b pb-2 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#6c5a26] mb-2">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
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
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
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
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method - Only shown for home delivery */}
              {formData.deliveryMethod === 'home' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#4e4219] mb-4 border-b pb-2 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment method
                  </h2>
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
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#6c5a26] mb-2">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a7233] focus:border-transparent"
                  placeholder="Special Delivery Instructions..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#8a7233] hover:bg-[#6c5a26] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending in progress...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    <span>Confirm the order</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;