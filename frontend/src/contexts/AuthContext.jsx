import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo credentials for testing
const demoCredentials = [
  {
    email: 'admin@kalamfoundation.org',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'priya@kalamfoundation.org',
    password: 'tutor123',
    role: 'tutor',
    center: 'Delhi Center'
  },
  {
    email: 'rajesh@kalamfoundation.org',
    password: 'tutor123',
    role: 'tutor',
    center: 'Mumbai Center'
  },
  {
    email: 'anita@kalamfoundation.org',
    password: 'tutor123',
    role: 'tutor',
    center: 'Bangalore Center'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user and token on app load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            // Verify token is still valid
            const response = await authAPI.getMe();
            if (response && response.data && response.data.user) {
              setUser(response.data.user);
            } else {
              // Invalid response structure
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            console.log('Token verification failed:', error);
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      // Call the real API
      const response = await authAPI.login({ email, password });

      if (response.success) {
        const { user, token } = response.data;

        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    demoCredentials
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
