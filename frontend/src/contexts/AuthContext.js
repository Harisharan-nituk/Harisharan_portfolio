// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Your Axios instance

// Create Context
const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Load token from localStorage
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // For checking initial auth status
  const navigate = useNavigate();
  console.log('[AuthContext] Initial state: token =', token, 'isLoadingAuth =', isLoadingAuth); // DEBUG

  useEffect(() => {
        console.log('[AuthContext] useEffect triggered. Token:', token); // DEBUG

    const userString = localStorage.getItem('user');
    if (token && userString) {
              console.log('[AuthContext] Token and user string found in localStorage.'); // DEBUG

      try {
        setCurrentUser(JSON.parse(userString));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('[AuthContext] User set from localStorage, Axios header set.'); // DEBUG

      } catch (e) {
        console.error("Error parsing stored user, clearing auth data:", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
    } else {
              console.log('[AuthContext] No token or no user string in localStorage.'); // DEBUG

      // No token or no user, ensure Axios default is clear
      delete api.defaults.headers.common['Authorization'];
    }
    setIsLoadingAuth(false);
        console.log('[AuthContext] setIsLoadingAuth set to false.'); // DEBUG

  }, [token]); // Re-run if token changes (e.g. on login/logout)

  const login = async (email, password) => {    

        console.log('[AuthContext] login function called with:', { email }); // DEBUG

    setIsLoadingAuth(true); // Indicate loading for login action
    try {
            console.log('[AuthContext] Attempting API call to /auth/login...'); // DEBUG

      const { data } = await api.post('/auth/login', { email, password });
           console.log('[AuthContext] API call successful. Response data:', data); // DEBUG

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      }));
      setToken(data.token); // This will trigger the useEffect above
      setCurrentUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      });
      // No need to set Axios header here, useEffect handles it
      setIsLoadingAuth(false);
      return data; // Return data for potential further actions in LoginPage
    } catch (error) {
      setIsLoadingAuth(false);
      console.error("Login failed in AuthContext:", error.response || error);
      throw error; // Re-throw error to be caught by LoginPage
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null); // This will trigger the useEffect to clear Axios header
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // No need to delete api.defaults.headers.common['Authorization'] here, useEffect handles it
    navigate('/login'); // Navigate to login page after logout
  };

  // Example: Can be used if user profile info is updated elsewhere and needs to reflect in context
  const updateUserInContext = (updatedUserInfo) => {
    const fullUserInfo = { ...currentUser, ...updatedUserInfo }; // Merge existing with new
    localStorage.setItem('user', JSON.stringify(fullUserInfo));
    setCurrentUser(fullUserInfo);
  };

  const value = {
    currentUser,
    token,
    isLoadingAuth,
    login,
    logout,
    updateUserInContext, // Changed name to be more specific
    isAdmin: currentUser?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Show a generic loading screen for auth state or render children */}
      {/* For simplicity, we let children render, components can check isLoadingAuth if needed */}
      {children}
    </AuthContext.Provider>
  );
};