import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import slide1 from '../../assets/slide1.png';
import slide2 from '../../assets/b73b1bb8fd172ef1b1d5886857db4575.jpg';
import slide3 from '../../assets/3149e1ba5dbcbd64854b7aadde3d78bf.jpg';
import slide4 from '../../assets/68320616ca4083231a671a0466db3c29.jpg';
import slide5 from '../../assets/1a1eb0e27ef42810ba82da16779355a8.jpg';
const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

 const backgroundImages = [slide1, slide2, slide3,slide4,slide5];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <section className="relative h-[800px] md:h-[700px] overflow-hidden">
      {/* Background slideshow */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div 
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <img 
              src={image} 
              alt="Olive oil background"
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="text-center text-white max-w-4xl mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
            Pure Olive Oil,<br className="hidden md:block" /> Pure Delight
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover centuries of tradition in every golden drop.<br /> 
            From intimate 0.5L bottles to grand 30L containers.
          </p>
        </div>

        {/* Feature indicators (dots) */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full mt-12 px-4">
          {[
            {
              title: "6 Varietals",
              subtitle: "From delicate to robust",
              description: "Perfect pairings for every culinary creation"
            },
            {
              title: "24/7 Freshness",
              subtitle: "Pressed daily",
              description: "Direct from our groves to your door"
            },
            {
              title: "Swift Delivery",
              subtitle: "Nationwide service",
              description: "Guaranteed freshness in 48 hours"
            },
            {
              title: "Purity Promise",
              subtitle: "Uncompromised quality",
              description: "Single-origin, cold-pressed perfection"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
            >
              <h3 className="text-2xl font-bold text-[#4e4219] mb-3">{feature.title}</h3>
              <p className="text-[#6c5a26] text-sm mb-2">{feature.subtitle}</p>
              <div className="h-1 w-12 bg-[#8a7233] mx-auto mb-3"></div>
              <p className="text-xs text-[#6c5a26]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;