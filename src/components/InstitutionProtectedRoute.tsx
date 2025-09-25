import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface InstitutionProtectedRouteProps {
  children: React.ReactNode;
}

export const InstitutionProtectedRoute: React.FC<InstitutionProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  
  // Check authentication status first
  const authValid = checkAuthStatus();
  
  // Check if user is authenticated
  if (!isAuthenticated || !authValid) {
    return <Navigate to="/institution/login" replace />;
  }
  
  // Check if user has institution session
  const institutionSession = localStorage.getItem('institutionSession');
  if (!institutionSession) {
    return <Navigate to="/institution/login" replace />;
  }
  
  try {
    const session = JSON.parse(institutionSession);
    if (session.role !== 'institution') {
      return <Navigate to="/institution/login" replace />;
    }
  } catch (error) {
    console.error('Error parsing institution session:', error);
    return <Navigate to="/institution/login" replace />;
  }
  
  return <>{children}</>;
};
