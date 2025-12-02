import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
// 1. استيراد الرابط الديناميكي
import { BASE_URL } from '../config';

// 2. إنشاء السياق
const AuthContext = createContext(null);

// 3. إنشاء المزوّد (Provider)
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token') || null,
    user: null,
    isLoading: true,
  });

  // 4. التأثير (Effect)
  useEffect(() => {
    const fetchUser = async () => {
      if (!authState.token) {
        setAuthState({ token: null, user: null, isLoading: false });
        return;
      }

      try {
        // 5. استخدام BASE_URL
        const apiClient = axios.create({
          baseURL: BASE_URL,
          headers: { 'Authorization': `Bearer ${authState.token}` }
        });
        
        const response = await apiClient.get('/users/me');
        
        setAuthState({ token: authState.token, user: response.data, isLoading: false });

      } catch (error) {
        console.error("Auth token is invalid, logging out.", error);
        localStorage.removeItem('token');
        setAuthState({ token: null, user: null, isLoading: false });
      }
    };

    fetchUser();
  }, [authState.token]);

  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      setAuthState(prev => ({ ...prev, token: token }));
    } else {
      localStorage.removeItem('token');
      setAuthState({ token: null, user: null, isLoading: false });
    }
  };

  const logout = () => {
    setToken(null);
  };
  
  const value = {
    token: authState.token,
    user: authState.user,
    isLoading: authState.isLoading,
    setToken,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------
// ---------------------------------------------------------
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};