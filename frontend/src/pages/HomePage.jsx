// src/pages/HomePage.jsx

import Header from "../components/common/Header";
import HeroSection from "../components/common/HeroSection";
import FeaturedProducts from "../components/common/FeaturedProducts";
import Testimonials from "../components/common/Testimonials";
import Footer from "../components/common/Footer";
// import PremiumQuality from "../components/common/PremiumQuality";





const HomePage = () => {
  return (
    <>
    <div className="flex flex-col min-h-screen">
        <Header />
     <HeroSection />
     <FeaturedProducts />
     {/* <PremiumQuality /> */}
     <Testimonials />
      <Footer />
      
      </div>
      
    </>
  );
};

export default HomePage;