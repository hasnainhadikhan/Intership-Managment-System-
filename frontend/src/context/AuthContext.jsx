import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

// Mock users for demo purposes
const mockUsers = {
  admin: { id: 1, name: 'Admin User', email: 'admin@ims.com', role: 'admin' },
  lead: { id: 2, name: 'Jane Lead', email: 'lead@ims.com', role: 'lead' },
  intern: { id: 3, name: 'John Intern', email: 'intern@ims.com', role: 'intern', intern_id: 1 }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Check mock users first (for demo)
    if (password === 'password123') {
      let userObj = null;
      
      if (email === 'admin@ims.com') userObj = mockUsers.admin;
      else if (email === 'lead@ims.com') userObj = mockUsers.lead;
      else if (email === 'intern@ims.com') userObj = mockUsers.intern;

      if (userObj) {
        const token = btoa(email + ':' + Date.now()); // Simple mock token
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
        return userObj;
      }
    }

    // Try real API if mock fails
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore API errors for logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
