import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Account from './pages/Account ';// Fixed space in import
import Contact from './pages/Contact ';
import Orders from './pages/Orders';
import Login from './pages/Login';
import SignUp from './pages/SignUp'; // Add SignUp import
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} /> {/* Add SignUp route */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<Account />}>
        </Route>
        <Route path="/orders" element={<Orders />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        {/* Add additional routes if needed */}
        <Route path="/product/:id" element={<ProductDetail />} />
<Route path="/checkout" element={<Checkout />} />

        <Route path="/terms" element={<div>Terms of Service Page</div>} />
        <Route path="/privacy" element={<div>Privacy Policy Page</div>} />
        <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;