import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { X, ShoppingCart, User, ChevronDown } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Add admin state
  const [cartItems, setCartItems] = useState([]);
  const modalRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load cart items from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    loadCart();
    window.addEventListener('storage', loadCart);

    return () => {
      window.removeEventListener('storage', loadCart);
    };
  }, []);

  // Check auth status and admin status on component mount and when location changes
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token && userInfo) {
          setIsLoggedIn(true);
          const user = JSON.parse(userInfo);
          setIsAdmin(user.isAdmin || false); // Set admin status
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    checkAuthStatus();
  }, [location.pathname]);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsAboutModalOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };

    if (isAboutModalOpen || isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isAboutModalOpen, isCartOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleAboutModal = () => {
    setIsAboutModalOpen(!isAboutModalOpen);
    closeMobileMenu();
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    closeMobileMenu();
  };

  const scrollToProducts = (e) => {
    e.preventDefault();
    
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToProducts: true } });
    } else {
      const productsSection = document.getElementById('nos-produits');
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    closeMobileMenu();
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      setIsLoggedIn(false);
      setIsAdmin(false); // Reset admin status on logout
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update cart item quantity
  const updateCartItem = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Calculate total items in cart
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal
const subtotal = cartItems.reduce(
  (total, item) => total + (parseFloat(item.price) * item.quantity),
  0
);

  return (
    <header className="bg-[#f8f5f0] border-b border-[#d8c9a0] sticky top-0 z-40">
      {/* Top banner */}
      <div className="bg-[#6c5a26] text-[#f0e9d8] text-center py-1.5 text-xs md:text-sm">
        Free delivery from 500DH • Organic Extra Virgin Olive Oil
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[#4e4219] hover:text-[#8a7233] transition-colors p-1"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center mx-auto md:mx-0 hover:opacity-80 transition-opacity">
            <div className="relative">
              <svg className="w-8 h-8 text-[#8a7233]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8 7 5 11 5 15c0 3.9 3.1 7 7 7s7-3.1 7-7c0-4-3-8-7-13z" />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#c0a968] rounded-full"></div>
            </div>
            <div className="ml-2 text-center">
              <h1 className="text-xl md:text-2xl font-bold text-[#4e4219]">LAMTAHRI</h1>
              <p className="text-xs text-[#6c5a26] uppercase tracking-wider">Frères</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className="font-medium text-[#4e4219] hover:text-[#8a7233] pb-1 border-b-2 border-transparent hover:border-[#a88e40] transition-all duration-200"
            >
              Home
            </Link>
            <button 
              onClick={scrollToProducts} 
              className="font-medium text-[#4e4219] hover:text-[#8a7233] pb-1 border-b-2 border-transparent hover:border-[#a88e40] transition-all duration-200"
            >
              Our Products
            </button>
            <button 
              onClick={toggleAboutModal} 
              className="font-medium text-[#4e4219] hover:text-[#8a7233] pb-1 border-b-2 border-transparent hover:border-[#a88e40] transition-all duration-200"
            >
              About Us
            </button>
            <Link 
              to="/contact" 
              className="font-medium text-[#4e4219] hover:text-[#8a7233] pb-1 border-b-2 border-transparent hover:border-[#a88e40] transition-all duration-200"
            >
              Contact
            </Link>
            {/* Only show Handle Orders if user is admin */}
            {isAdmin && (
              <Link 
                to="/admindashboard" 
                className="font-medium text-[#4e4219] hover:text-[#8a7233] pb-1 border-b-2 border-transparent hover:border-[#a88e40] transition-all duration-200"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button 
              onClick={toggleCart}
              className="relative text-[#4e4219] hover:text-[#8a7233] transition-colors p-1"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8a7233] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Account Section */}
            {isLoggedIn ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center text-[#4e4219] hover:text-[#8a7233] transition-colors">
                  <User className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">My Account</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-[#d8c9a0]">
                  <Link 
                    to="/account" 
                    className="flex items-center px-4 py-2 text-sm text-[#4e4219] hover:bg-[#f8f5f0] transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profil
                  </Link>
                  
                  <Link 
                    to="/Orders" 
                    className="flex items-center px-4 py-2 text-sm text-[#4e4219] hover:bg-[#f8f5f0] transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>
                  <hr className="my-1 border-[#e8ddc5]" />
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-[#4e4219] hover:bg-[#f8f5f0] transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="hidden md:flex items-center text-[#4e4219] hover:text-[#8a7233] transition-colors"
              >
                <User className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <Transition
          show={isMobileMenuOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <nav className="md:hidden bg-[#f8f5f0] border-t border-[#d8c9a0] shadow-lg px-4 py-4 space-y-3">
            <Link 
              to="/" 
              onClick={closeMobileMenu} 
              className="block font-medium text-[#4e4219] hover:text-[#8a7233] py-2 border-b border-[#e8ddc5] transition-colors"
            >
              Accueil
            </Link>
            <button 
              onClick={scrollToProducts} 
              className="block w-full text-left font-medium text-[#4e4219] hover:text-[#8a7233] py-2 border-b border-[#e8ddc5] transition-colors"
            >
              Nos Produits
            </button>
            <button 
              onClick={toggleAboutModal} 
              className="block w-full text-left font-medium text-[#4e4219] hover:text-[#8a7233] py-2 border-b border-[#e8ddc5] transition-colors"
            >
              À Propos
            </button>
            <Link 
              to="/contact" 
              onClick={closeMobileMenu} 
              className="block font-medium text-[#4e4219] hover:text-[#8a7233] py-2 border-b border-[#e8ddc5] transition-colors"
            >
              Contact
            </Link>
            {/* Only show Handle Orders in mobile menu if user is admin */}
            {isAdmin && (
              <Link 
                to="/handle-orders" 
                onClick={closeMobileMenu} 
                className="block font-medium text-[#4e4219] hover:text-[#8a7233] py-2 border-b border-[#e8ddc5] transition-colors"
              >
                Handle Orders
              </Link>
            )}
            
            {/* Mobile Cart Button */}
            <button 
              onClick={toggleCart}
              className="flex items-center w-full text-left font-medium text-[#4e4219] hover:text-[#8a7233] py-2 border-b border-[#e8ddc5] transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Panier {cartItemCount > 0 && `(${cartItemCount})`}
            </button>
            
            {/* Mobile User Menu */}
            {isLoggedIn ? (
              <>
                <Link 
                  to="/account" 
                  onClick={closeMobileMenu} 
                  className="block font-medium text-[#4e4219] hover:text-[#8a7233] py-2 border-b border-[#e8ddc5] transition-colors"
                >
                  Mon Compte
                </Link>
                <Link 
                  to="/account/orders" 
                  onClick={closeMobileMenu} 
                  className="block font-medium text-[#4e4219] hover:text-[#8a7233] py-2 border-b border-[#e8ddc5] transition-colors"
                >
                  My Orders
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }} 
                  className="block w-full text-left font-medium text-[#4e4219] hover:text-[#8a7233] py-2 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={closeMobileMenu} 
                className="block font-medium text-[#4e4219] hover:text-[#8a7233] py-2 transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </Transition>
      </div>

      {/* About Us Modal */}
      <Transition show={isAboutModalOpen}>
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"></div>
        </Transition.Child>

        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center min-h-screen p-4 z-50">
            <div
              ref={modalRef}
              className="bg-[#f8f5f0] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#d8c9a0]"
            >
              <div className="bg-[#6c5a26] h-3 w-full rounded-t-xl"></div>

              <div className="relative">
                <button 
                  onClick={toggleAboutModal}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-all z-10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-[#4e4219]" />
                </button>

                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3">
                      <div className="bg-[#e8ddc5] rounded-lg p-4 h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto text-[#6c5a26]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8 7 5 11 5 15c0 3.9 3.1 7 7 7s7-3.1 7-7c0-4-3-8-7-13z" />
                          </svg>
                          <h3 className="text-xl font-bold text-[#4e4219] mt-2">Since 1952</h3>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h2 className="text-3xl font-bold text-[#4e4219] mb-4 font-serif">Our Olive Oil Legacy</h2>
                      <p className="text-[#4e4219] mb-4 leading-relaxed">
                        <strong className="text-[#6c5a26]">Lamtahri Frères</strong> has been a cornerstone of Moroccan olive oil production for over seven decades. Our family's dedication to quality and tradition has made us one of the most trusted names in organic extra virgin olive oil.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-[#8a7233] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-[#4e4219]">100% Organic Cold Pressed</span>
                        </div>
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-[#8a7233] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-[#4e4219]">Family-Owned Since 1952</span>
                        </div>
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-[#8a7233] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-[#4e4219]">Sustainable Farming Practices</span>
                        </div>
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-[#8a7233] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-[#4e4219]">EU Organic Certified</span>
                        </div>
                      </div>
                      <blockquote className="border-l-4 border-[#8a7233] pl-4 italic text-[#4e4219] mb-6">
                        "We don't just produce olive oil - we cultivate a heritage passed down through generations, honoring both the land and the people who work it."
                      </blockquote>
                      <div className="flex justify-end">
                        <button 
                          onClick={toggleAboutModal}
                          className="bg-[#6c5a26] hover:bg-[#8a7233] text-white px-6 py-2 rounded-md transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition.Child>
      </Transition>

      {/* Cart Sidebar */}
      <Transition show={isCartOpen}>
        <Transition.Child
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"></div>
        </Transition.Child>

        <Transition.Child
          enter="transform transition ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
            <div className="relative w-screen max-w-md">
              <div 
                ref={cartRef}
                className="h-full flex flex-col bg-[#f8f5f0] shadow-xl overflow-y-scroll"
              >
                <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-[#4e4219]">Shopping cart</h2>
                    <button
                      type="button"
                      onClick={toggleCart}
                      className="text-[#4e4219] hover:text-[#8a7233] transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
                      {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingCart
                            className="mx-auto h-12 w-12 text-[#d8c9a0]"
                            strokeWidth={1}
                          />
                          <h3 className="mt-2 text-sm font-medium text-[#4e4219]">Your shopping cart is empty</h3>
                          <p className="mt-1 text-sm text-[#6c5a26]">
                            Start by adding some products to your cart.
                          </p>
                          <div className="mt-6">
                            <button
                              onClick={() => {
                                toggleCart();
                                scrollToProducts({ preventDefault: () => {} });
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6c5a26] hover:bg-[#8a7233] transition-colors"
                            >
                              <svg
                                className="-ml-1 mr-2 h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                              See our products
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ul className="-my-6 divide-y divide-[#e8ddc5]">
                          {cartItems.map((item) => (
                            <li key={item.id} className="py-6 flex">
                              <div className="flex-shrink-0 w-24 h-24 border border-[#e8ddc5] rounded-md overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover object-center"
                                />
                              </div>

                              <div className="ml-4 flex-1 flex flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-[#4e4219]">
                                    <h3>{item.name}</h3>
                                    <p className="ml-4">{item.price} DH</p>
                                  </div>
                                  <p className="mt-1 text-sm text-[#6c5a26]">{item.variation}</p>
                                </div>
                                <div className="flex-1 flex items-end justify-between text-sm">
                                  <div className="flex items-center border border-[#e8ddc5] rounded-md">
                                    <button
                                      onClick={() => updateCartItem(item.id, item.quantity - 1)}
                                      className="px-2 py-1 text-[#6c5a26] hover:bg-[#e8ddc5] transition-colors"
                                    >
                                      -
                                    </button>
                                    <span className="px-2">{item.quantity}</span>
                                    <button
                                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                                      className="px-2 py-1 text-[#6c5a26] hover:bg-[#e8ddc5] transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="font-medium text-[#8a7233] hover:text-[#6c5a26] transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {cartItems.length > 0 && (
                  <div className="border-t border-[#e8ddc5] px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-[#4e4219]">
                      <p>Subtotal</p>
                      <p>{subtotal.toFixed(2)} DH</p>
                    </div>
                    <p className="mt-0.5 text-sm text-[#6c5a26]">
                      Shipping and taxes calculated at checkout.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/checkout"
                        onClick={toggleCart}
                        className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#6c5a26] hover:bg-[#8a7233] transition-colors"
                      >
                        Place the order
                      </Link>
                    </div>
                    <div className="mt-4 flex justify-center text-sm text-center text-[#6c5a26]">
                      <p>
                        or{' '}
                        <button
                          type="button"
                          onClick={toggleCart}
                          className="text-[#8a7233] font-medium hover:text-[#6c5a26] transition-colors"
                        >
                          Continue shopping<span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Transition.Child>
      </Transition>
    </header>
  );
};

export default Header;                                