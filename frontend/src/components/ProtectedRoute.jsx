import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    // إذا لم يكن المستخدم مسجلاً (لا يوجد توكن)،
    // قم بتوجيهه إلى صفحة تسجيل الدخول.
    return <Navigate to="/login" replace />;
  }

  // إذا كان المستخدم مسجلاً، قم بعرض المكون المطلوب.
  return children;
}

export default ProtectedRoute;