import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roleRequired }) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (roleRequired && currentUser.role !== roleRequired && currentUser.role !== 'manager') {
        return <div className="p-10 text-center text-red-500 font-bold">Access Denied: You do not have permission to view this page.</div>;
    }

    return children;
};

export default ProtectedRoute;
