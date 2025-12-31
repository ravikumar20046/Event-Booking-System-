import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children, user }) => {
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to='/login' replace />;
  }
  return children;
};

export default AdminRoute;
