import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 1. إنشاء السياق
const AuthContext = createContext(null);

// 2. إنشاء المزوّد (Provider)
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token') || null,
    user: null,         // سيبقى null في البداية
    isLoading: true,    // حالة جديدة لتتبع التحميل الأولي
  });

  // 3. التأثير (Effect) الذي سيتم تشغيله عند بدء التطبيق أو تغير التوكن
  useEffect(() => {
    const fetchUser = async () => {
      // إذا لم يكن هناك توكن، نتوقف عن التحميل ونؤكد أن لا يوجد مستخدم
      if (!authState.token) {
        setAuthState({ token: null, user: null, isLoading: false });
        return;
      }

      try {
        // إذا كان هناك توكن، نحاول جلب بيانات المستخدم
        const apiClient = axios.create({
          baseURL: 'http://localhost:8000',
          headers: { 'Authorization': `Bearer ${authState.token}` }
        });
        const response = await apiClient.get('/users/me');
        
        // عند النجاح، نحدّث الحالة بالتوكن والمستخدم، ونوقف التحميل
        setAuthState({ token: authState.token, user: response.data, isLoading: false });

      } catch (error) {
        console.error("Auth token is invalid, logging out.", error);
        // إذا فشل الطلب (التوكن غير صالح)، نزيل التوكن ونسجل الخروج
        localStorage.removeItem('token');
        setAuthState({ token: null, user: null, isLoading: false });
      }
    };

    fetchUser();
  }, [authState.token]); // هذا التأثير يعتمد فقط على التوكن

  // 4. دوال لتعديل الحالة من المكونات الأخرى
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      // فقط نحدّث التوكن، والـ useEffect سيهتم بالباقي
      setAuthState(prev => ({ ...prev, token: token }));
    } else {
      localStorage.removeItem('token');
      // نحدّث كل شيء إلى null
      setAuthState({ token: null, user: null, isLoading: false });
    }
  };

  const logout = () => {
    setToken(null);
  };
  
  // 5. تجميع القيمة التي سيوفرها السياق
  const value = {
    token: authState.token,
    user: authState.user,
    isLoading: authState.isLoading,
    setToken,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* لا نعرض التطبيق إلا بعد انتهاء التحميل الأولي */}
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

// 6. الخطاف المخصص للوصول إلى السياق
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};