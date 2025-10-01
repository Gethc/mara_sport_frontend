import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface InstitutionProtectedRouteProps {
  children: React.ReactNode;
}

export const InstitutionProtectedRoute: React.FC<InstitutionProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    // Check authentication status
    const storedStudent = localStorage.getItem('student');
    const authToken = localStorage.getItem('authToken');
    
    if (!storedStudent || !authToken) {
      setIsValid(false);
      setIsChecking(false);
      return;
    }
    
    try {
      const parsedStudent = JSON.parse(storedStudent);
      if (parsedStudent && parsedStudent.email) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (error) {
      console.error('Error parsing stored student:', error);
      setIsValid(false);
    }
    
    setIsChecking(false);
  }, []);
  
  // Show loading while checking
  if (isChecking) {
    return <div>Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated || !isValid) {
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
