import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const FeaturedProducts = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to extract numeric price from priceDisplay string
  const extractPrice = (priceDisplay) => {
    if (!priceDisplay || typeof priceDisplay !== 'string') {
      return Infinity; // Put items without valid prices at the end
    }
    
    // Remove currency symbols and extract numbers
    const match = priceDisplay.match(/[\d,]+\.?\d*/);
    if (match) {
      // Remove commas and convert to number
      return parseFloat(match[0].replace(/,/g, ''));
    }
    
    return Infinity; // Put items without valid prices at the end
  };

  useEffect(() => {
    setLoading(true);
    fetch("https://acceptable-bravery-production-302d.up.railway.app/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched products:", data); // Debug log
        
        // Pick only the needed fields from each product
        const filteredProducts = data.map(({ _id, name, priceDisplay, size, description, image }) => ({
          _id,
          name,
          priceDisplay,
          size,
          description,
          image,
        }));
        
        // Sort products by price (lowest to highest)
        const sortedProducts = filteredProducts.sort((a, b) => {
          const priceA = extractPrice(a.priceDisplay);
          const priceB = extractPrice(b.priceDisplay);
          return priceA - priceB;
        });
        
        console.log("Filtered and sorted products:", sortedProducts); // Debug log
        setAllProducts(sortedProducts);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const [visibleProducts, setVisibleProducts] = useState(3);
  const [showAll, setShowAll] = useState(false);

  const toggleShowAll = () => {
    setShowAll(!showAll);
    setVisibleProducts(showAll ? 3 : allProducts.length);
  };

  // Function to handle image error and provide fallback
  const handleImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.src = "https://acceptable-bravery-production-302d.up.railway.app/uploads/products/product-1.jpg"; // Fallback image
  };

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://acceptable-bravery-production-302d.up.railway.app/uploads/products/product-1.jpg";
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

  if (loading) {
    return (
      <section id="nos-produits" className="py-16 bg-[#f8f5f0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8a7233] mx-auto mb-4"></div>
              <p className="text-[#6c5a26]">Loading products...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="nos-produits" className="py-16 bg-[#f8f5f0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-[#8a7233] text-white px-4 py-2 rounded-md hover:bg-[#6c5a26] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="nos-produits" className="py-16 bg-[#f8f5f0]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#4e4219] mb-4">Our Olive Oil Selection</h2>
        <p className="text-center text-[#6c5a26] mb-12 max-w-2xl mx-auto">
          The same premium quality, in sizes for every need - sorted by price
        </p>
        
        {allProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6c5a26] text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProducts.slice(0, visibleProducts).map(product => (
                <Link 
                  key={product._id} 
                  to={`/product/${product._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group block"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={`${product.name} - ${product.size} bottle`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <span className="text-white font-bold text-lg">
                        {product.size ? `${product.size} Bottle` : 'Premium Olive Oil'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#4e4219] mb-2">
                      {product.name || 'Premium Olive Oil'}
                    </h3>
                    <p className="text-[#6c5a26] mb-4 leading-relaxed line-clamp-3">
                      {product.description || 'Premium quality olive oil crafted with care.'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-[#8a7233]">
                        {product.priceDisplay || 'Contact for Price'}
                      </span>
                      <span className="bg-[#8a7233] group-hover:bg-[#6c5a26] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors transform group-hover:scale-105">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {allProducts.length > 3 && (
              <div className="text-center mt-12">
                <button
                  onClick={toggleShowAll}
                  className="inline-block border-2 border-[#8a7233] text-[#8a7233] hover:bg-[#8a7233] hover:text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  {showAll ? 'Show Less' : 'Show More Sizes'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;