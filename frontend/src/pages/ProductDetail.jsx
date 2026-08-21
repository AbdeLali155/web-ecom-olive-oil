import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Shield, Truck, Award, Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import OrderModal from './OrderModal';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/400x400/f8f5f0/4e4219?text=Olive+Oil";
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path, construct the full URL
    if (imagePath.startsWith('/uploads/')) {
      return `https://acceptable-bravery-production-302d.up.railway.app${imagePath}`;
    }
    
    // If it's just a filename, construct the full path
    return `https://acceptable-bravery-production-302d.up.railway.app/uploads/products/${imagePath}`;
  };

  // Function to handle image error and provide fallback
  const handleImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.src = "https://via.placeholder.com/400x400/f8f5f0/4e4219?text=Olive+Oil";
  };

  // Function to get all product images (main image + additional images)
  const getProductImages = (product) => {
    const images = [];
    
    // Add main image if it exists
    if (product.image) {
      images.push(getImageUrl(product.image));
    }
    
    // Add additional images if they exist
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        const imageUrl = getImageUrl(img);
        // Avoid duplicates
        if (!images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      });
    }
    
    // If no images found, provide a placeholder
    if (images.length === 0) {
      images.push("https://via.placeholder.com/400x400/f8f5f0/4e4219?text=Olive+Oil");
    }
    
    return images;
  };

  useEffect(() => {
    async function fetchAndFindProduct() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://acceptable-bravery-production-302d.up.railway.app/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const products = await response.json();
        console.log("Fetched products:", products); // Debug log
        
        setAllProducts(products);
        const foundProduct = products.find(p => p._id === id);
        
        if (!foundProduct) {
          setProduct(null);
          setError("Product not found");
        } else {
          console.log("Found product:", foundProduct); // Debug log
          setProduct(foundProduct);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchAndFindProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8a7233] mx-auto mb-4"></div>
          <p className="text-[#6c5a26]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4e4219] mb-4">
            {error || "Product Not Found"}
          </h2>
          <Link 
            to="/" 
            className="text-[#8a7233] hover:underline bg-white px-4 py-2 rounded-md shadow-md"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleOrder = () => {
    setShowOrderModal(true);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const addToCart = () => {
    try {
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(item => 
        item.id === product._id && item.variation === product.size
      );
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        const cartItem = {
          id: product._id,
          name: product.name,
          price: product.price,
          priceDisplay: product.priceDisplay,
          variation: product.size,
          image: productImages[0], // Use the first image
          quantity: quantity
        };
        existingCart.push(cartItem);
      }
      
      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Show success feedback
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      
      // Dispatch a custom event to notify the header about cart update
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-[#8a7233] hover:text-[#6c5a26] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src={productImages[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            
            {/* Image thumbnails - only show if there are multiple images */}
            {productImages.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-[#8a7233]' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`View ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#4e4219] mb-2">
                {product.name || 'Premium Olive Oil'}
              </h1>
              <p className="text-xl text-[#8a7233] font-semibold">
                {product.size ? `${product.size} Bottle` : 'Premium Quality'}
              </p>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-[#8a7233]">
              {product.priceDisplay || 'Contact for Price'}
            </div>

            {/* Description */}
            <p className="text-[#6c5a26] text-lg leading-relaxed">
              {product.description || 'Premium quality olive oil crafted with care for the finest taste and nutrition.'}
            </p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#4e4219] mb-3">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#8a7233] flex-shrink-0" />
                      <span className="text-[#6c5a26]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-[#4e4219] font-medium">Quantity:</span>
              <div className="flex items-center border border-[#8a7233] rounded-lg">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-[#8a7233] hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-[#8a7233] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Add to Cart Button */}
              <button 
                onClick={addToCart}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                  addedToCart 
                    ? 'bg-green-600 text-white' 
                    : 'bg-[#6c5a26] hover:bg-[#8a7233] text-white'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{addedToCart ? 'Added to cart!' : 'Add to cart'}</span>
              </button>

              {/* Order Button */}
              <button 
                onClick={handleOrder}
                className="w-full bg-[#8a7233] hover:bg-[#6c5a26] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border-2 border-[#8a7233] hover:border-[#6c5a26]"
              >
                <span>Order now</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Shield className="w-8 h-8 text-[#8a7233] mx-auto mb-2" />
                <p className="text-sm text-[#6c5a26]">Quality Guaranteed</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-[#8a7233] mx-auto mb-2" />
                <p className="text-sm text-[#6c5a26]">Fast Shipping</p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-[#8a7233] mx-auto mb-2" />
                <p className="text-sm text-[#6c5a26]">Premium Quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Tabs */}
        {product.nutritionFacts && (
          <div className="mt-16">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-[#4e4219] mb-6">Nutrition Facts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {product.nutritionFacts.calories && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-[#8a7233]">{product.nutritionFacts.calories}</div>
                    <div className="text-[#6c5a26]">Calories</div>
                  </div>
                )}
                {product.nutritionFacts.fat && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-[#8a7233]">{product.nutritionFacts.fat}</div>
                    <div className="text-[#6c5a26]">Total Fat</div>
                  </div>
                )}
                {product.nutritionFacts.saturatedFat && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-[#8a7233]">{product.nutritionFacts.saturatedFat}</div>
                    <div className="text-[#6c5a26]">Saturated Fat</div>
                  </div>
                )}
                {product.nutritionFacts.vitaminE && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-[#8a7233]">{product.nutritionFacts.vitaminE}</div>
                    <div className="text-[#6c5a26]">Vitamin E</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        {allProducts.length > 1 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-[#4e4219] mb-8 text-center">Other Sizes Available</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.filter(p => p._id !== product._id).slice(0, 4).map(relatedProduct => (
                <Link 
                  key={relatedProduct._id}
                  to={`/product/${relatedProduct._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img 
                      src={getImageUrl(relatedProduct.image)} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-[#4e4219] mb-1">
                      {relatedProduct.name || 'Premium Olive Oil'}
                    </h4>
                    <p className="text-sm text-[#6c5a26] mb-2">
                      {relatedProduct.size || 'Premium Quality'}
                    </p>
                    <p className="text-[#8a7233] font-bold">
                      {relatedProduct.priceDisplay || 'Contact for Price'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal 
          product={product} 
          quantity={quantity} 
          onClose={() => setShowOrderModal(false)} 
        />
      )}
    </div>
  );
};

export default ProductDetail;