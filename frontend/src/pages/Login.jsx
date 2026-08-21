import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formErrors = validateForm();
  if (Object.keys(formErrors).length > 0) {
    setErrors(formErrors);
    return;
  }

  setIsLoading(true);
  setErrors({});

  try {
    const response = await fetch('https://acceptable-bravery-production-302d.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), // formData = { email, password }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Erreur de connexion');
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data.user));

    // You can also store the user object if needed:
    // localStorage.setItem('user', JSON.stringify(data.user));

    navigate('/'); // Redirect to homepage or dashboard

  } catch (error) {
    setErrors({ general: error.message });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <Header />
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg border border-[#d8c9a0] p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <svg className="w-12 h-12 text-[#8a7233]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8 7 5 11 5 15c0 3.9 3.1 7 7 7s7-3.1 7-7c0-4-3-8-7-13z" />
                  </svg>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#c0a968] rounded-full"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#4e4219] mb-2">Login</h2>
              <p className="text-[#6c5a26] text-sm">Log in to your LAMTAHRI account</p>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#4e4219] mb-2">
                  E-mail address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                    errors.email ? 'border-red-300' : 'border-[#d8c9a0]'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#4e4219] mb-2">
                 Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                    errors.password ? 'border-red-300' : 'border-[#d8c9a0]'
                  }`}
                  placeholder="Your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#8a7233] focus:ring-[#8a7233] border-[#d8c9a0] rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#6c5a26]">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-[#8a7233] hover:text-[#6c5a26]">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8a7233] hover:bg-[#6c5a26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a7233] transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Login...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#6c5a26]">
               You don't have an account?{' '}
                <Link to="/signup" className="font-medium text-[#8a7233] hover:text-[#6c5a26]">
                  Create a new account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;