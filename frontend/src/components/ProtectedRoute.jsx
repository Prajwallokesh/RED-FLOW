import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // While rehydrating from localStorage, show nothing (avoids flash redirect)
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Authenticated but wrong role — redirect to their dashboard
    const dashMap = { donor: '/donor', admin: '/admin', hospital: '/hospital' };
    return <Navigate to={dashMap[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
