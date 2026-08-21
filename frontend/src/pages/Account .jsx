import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [originalData, setOriginalData] = useState({}); // Store original data for comparison
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Load user data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setErrors({ general: 'User not authenticated' });
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error('Erreur lors du chargement du profil');
      }

      const userData = await response.json();

      // Store both current form data and original data
      const profileData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      };

      setFormData(profileData);
      setOriginalData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });

    } catch (error) {
      setErrors({ general: error.message || 'Erreur lors du chargement du profil' });
    }
  };

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
    
    // Clear success message when editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    // Password validation only if changing password
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Le mot de passe actuel est requis';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Le nouveau mot de passe est requis';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
      }

      if (!formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Veuillez confirmer le nouveau mot de passe';
      } else if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    return newErrors;
  };

  const updateProfile = async (profileData) => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('http://localhost:5000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
    }

    return await response.json();
  };

  const updatePassword = async (passwordData) => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('http://localhost:5000/api/user/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors du changement de mot de passe');
    }

    return await response.json();
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
      // Check if profile data has changed
      const profileDataChanged = 
        formData.firstName !== originalData.firstName ||
        formData.lastName !== originalData.lastName ||
        formData.email !== originalData.email ||
        formData.phone !== originalData.phone;

      let profileUpdateSuccess = false;
      let passwordUpdateSuccess = false;

      // Update profile if data has changed
      if (profileDataChanged) {
        const profileData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
        };

        await updateProfile(profileData);
        profileUpdateSuccess = true;

        // Update original data to reflect changes
        setOriginalData(profileData);
      }

      // Update password if requested
      if (showPasswordFields) {
        const passwordData = {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        };

        await updatePassword(passwordData);
        passwordUpdateSuccess = true;
      }

      // Set success message based on what was updated
      let message = '';
      if (profileUpdateSuccess && passwordUpdateSuccess) {
        message = 'Profil et mot de passe mis à jour avec succès !';
      } else if (profileUpdateSuccess) {
        message = 'Profil mis à jour avec succès !';
      } else if (passwordUpdateSuccess) {
        message = 'Mot de passe mis à jour avec succès !';
      } else {
        message = 'Aucune modification détectée.';
      }

      setSuccessMessage(message);
      setIsEditing(false);
      setShowPasswordFields(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
    } catch (error) {
      console.error('Update error:', error);
      setErrors({ 
        general: error.message || 'Erreur lors de la mise à jour. Veuillez réessayer.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel editing - reset form data to original values
      setFormData(prev => ({
        ...originalData,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      setShowPasswordFields(false);
    }
    
    setIsEditing(!isEditing);
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <Header />
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg border border-[#d8c9a0] p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-[#8a7233] rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#c0a968] rounded-full border-2 border-white"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#4e4219] mb-2">My profil</h2>
              <p className="text-[#6c5a26] text-sm">Manage your personal information</p>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6 text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="border-b border-[#d8c9a0] pb-6">
                <h3 className="text-lg font-medium text-[#4e4219] mb-4">Personal informations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#4e4219] mb-1">
                      Firstname
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                        errors.firstName ? 'border-red-300' : 'border-[#d8c9a0]'
                      } ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#4e4219] mb-1">
                      Lastname
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                        errors.lastName ? 'border-red-300' : 'border-[#d8c9a0]'
                      } ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="email" className="block text-sm font-medium text-[#4e4219] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                      errors.email ? 'border-red-300' : 'border-[#d8c9a0]'
                    } ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-[#4e4219] mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                      errors.phone ? 'border-red-300' : 'border-[#d8c9a0]'
                    } ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Password Section */}
              {isEditing && (
                <div className="border-b border-[#d8c9a0] pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-[#4e4219]">Password</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordFields(!showPasswordFields);
                        // Clear password fields when toggling
                        if (showPasswordFields) {
                          setFormData(prev => ({
                            ...prev,
                            currentPassword: '',
                            newPassword: '',
                            confirmNewPassword: ''
                          }));
                          // Clear password-related errors
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.currentPassword;
                            delete newErrors.newPassword;
                            delete newErrors.confirmNewPassword;
                            return newErrors;
                          });
                        }
                      }}
                      className="text-sm text-[#8a7233] hover:text-[#6c5a26] underline"
                    >
                      {showPasswordFields ? 'Cancel changes' : 'Change password'}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-[#4e4219] mb-1">
                          Current password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                            errors.currentPassword ? 'border-red-300' : 'border-[#d8c9a0]'
                          }`}
                        />
                        {errors.currentPassword && (
                          <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-[#4e4219] mb-1">
                          New password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                            errors.newPassword ? 'border-red-300' : 'border-[#d8c9a0]'
                          }`}
                          placeholder="Atleast 6 characters"
                        />
                        {errors.newPassword && (
                          <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-[#4e4219] mb-1">
                          Confirm new password
                        </label>
                        <input
                          type="password"
                          id="confirmNewPassword"
                          name="confirmNewPassword"
                          value={formData.confirmNewPassword}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a7233] focus:border-[#8a7233] ${
                            errors.confirmNewPassword ? 'border-red-300' : 'border-[#d8c9a0]'
                          }`}
                          placeholder="Repeat the new password"
                        />
                        {errors.confirmNewPassword && (
                          <p className="mt-1 text-xs text-red-600">{errors.confirmNewPassword}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={toggleEdit}
                      className="flex-1 py-2 px-4 border border-[#8a7233] rounded-md shadow-sm text-sm font-medium text-[#8a7233] bg-white hover:bg-[#f8f5f0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a7233] transition-colors"
                    >
                      Change profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={toggleEdit}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8a7233] hover:bg-[#6c5a26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a7233] transition-colors ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </div>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>

            {/* Additional Links */}
            <div className="mt-8 pt-6 border-t border-[#d8c9a0] text-center space-y-2">
              <p className="text-sm text-[#6c5a26]">
                <Link to="/orders" className="text-[#8a7233] hover:text-[#6c5a26] underline">
                  My Orders
                </Link>
              </p>
              <p className="text-xs text-[#6c5a26]">
                Need Help?{' '}
                <Link to="/contact" className="text-[#8a7233] hover:text-[#6c5a26] underline">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;