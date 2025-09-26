import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

export interface Student {
  id: number;
  fname: string;
  mname?: string;
  lname: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  address?: string;
  institute_id?: number;
  student_id?: string;
  
  // Computed properties for compatibility
  fullName?: string;
  instituteName?: string;
  dateOfBirth?: string;
  isEmailVerified?: boolean;
  
  // Parent/Guardian Information (from parents_info table)
  parentGuardianName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentRelation?: string;
  parentsComing?: 'yes' | 'no';
  
  // Medical Information (from medical_info table)
  medicalInfo?: string;
  haveMedInfo?: 'yes' | 'no';
  
  // Health Information (from health_info table)
  healthInfo?: string;
  healthStatus?: 'Yes' | 'No';
  
  // Profile picture
  profilePicture?: string;
}

interface AuthContextType {
  student: Student | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOTP: (userData: any) => Promise<boolean>;
  register: (studentData: Partial<Student> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Student>) => void;
  checkAuthStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(() => {
    // Initialize student from localStorage immediately
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      try {
        return JSON.parse(storedStudent);
      } catch (error) {
        console.error('Error parsing stored student on init:', error);
        // Clear invalid data
        localStorage.removeItem('student');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('institutionSession');
        return null;
      }
    }
    return null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize authentication state from localStorage immediately
    const storedStudent = localStorage.getItem('student');
    return !!storedStudent;
  });

  useEffect(() => {
    // Additional validation on mount - this ensures we have the latest state
    const storedStudent = localStorage.getItem('student');
    if (storedStudent && !student) {
      try {
        const parsedStudent = JSON.parse(storedStudent);
        setStudent(parsedStudent);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored student in useEffect:', error);
        // Clear invalid data
        localStorage.removeItem('student');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('institutionSession');
        setIsAuthenticated(false);
      }
    } else if (!storedStudent && student) {
      // Clear state if localStorage was cleared externally
      setStudent(null);
      setIsAuthenticated(false);
    }
  }, [student]);

  const loginWithOTP = async (userData: any): Promise<boolean> => {
    try {
      console.log('OTP login with user data:', userData);
      
      // Store the JWT token for API authentication
      if (userData.access_token) {
        localStorage.setItem('authToken', userData.access_token);
        console.log('Auth token stored successfully:', userData.access_token.substring(0, 50) + '...');
      }
      
      // Create user profile based on role
      const userProfile: Student = {
        id: userData.user_id || 0,
        fname: userData.full_name?.split(' ')[0] || 'User',
        lname: userData.full_name?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        dob: '',
        gender: 'Other',
        phone: '',
        address: '',
        institute_id: 0,
        student_id: userData.student_id || '',
        fullName: userData.full_name || 'User',
        instituteName: userData.role === 'institution' ? 'Institution' : 'Student',
        isEmailVerified: userData.is_verified || true,
      };
      
      setStudent(userProfile);
      setIsAuthenticated(true);
      localStorage.setItem('student', JSON.stringify(userProfile));
      
      // Set role-specific session
      if (userData.role === 'institution') {
        localStorage.setItem('institutionSession', JSON.stringify({ 
          email: userData.email, 
          role: 'institution' 
        }));
      }
      
      console.log('OTP login successful for:', userData.role);
      return true;
    } catch (error) {
      console.error('OTP login failed:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if it's an admin login
      const adminResponse = await apiService.adminLogin(email, password);
      console.log('Admin login response:', adminResponse);
      console.log('Response data:', adminResponse.data);
      
      // Type check the response data
      if (adminResponse.data && typeof adminResponse.data === 'object') {
        const responseData = adminResponse.data as any;
        console.log('Response data.data:', responseData.data);
        console.log('Access token:', responseData.data?.access_token);
        
        if (responseData.success) {
          // Store the JWT token for API authentication
          if (responseData.data?.access_token) {
            localStorage.setItem('authToken', responseData.data.access_token);
            console.log('Auth token stored successfully:', responseData.data.access_token.substring(0, 50) + '...');
          } else { 
            console.error('No access token in admin response:', adminResponse);
            return false;
          }
        
          const adminProfile: Student = {
            id: 0,
            fname: 'Admin',
            lname: 'User',
            email: email,
            dob: '',
            gender: 'Other',
            fullName: 'Admin User',
            instituteName: 'System Administration',
            student_id: 'ADMIN',
            isEmailVerified: true,
          };
          
          setStudent(adminProfile);
          setIsAuthenticated(true);
          localStorage.setItem('student', JSON.stringify(adminProfile));
          localStorage.setItem('adminSession', JSON.stringify({ 
            email: email, 
            role: 'admin' 
          }));
          
          return true;
        } else {
          console.log('Admin login failed:', responseData.message);
          return false; // Explicitly return false for failed admin login
        }
      }
      
      // Try student login - simplified approach
      const studentResponse = await apiService.studentLogin(email, password);
      if (studentResponse.data && typeof studentResponse.data === 'object') {
        const userData = studentResponse.data as any;
        
        const student: Student = {
          id: userData.id || 0,
          fname: userData.fname || '',
          mname: userData.mname || '',
          lname: userData.lname || '',
          email: userData.email || '',
          dob: userData.dob || '',
          gender: userData.gender || 'Other',
          phone: userData.phone || '',
          address: userData.address || '',
          institute_id: userData.institute_id || 0,
          student_id: userData.student_id || '',
          fullName: `${userData.fname || ''} ${userData.mname || ''} ${userData.lname || ''}`.trim(),
          dateOfBirth: userData.dob || '',
          isEmailVerified: true,
        };

        setStudent(student);
        setIsAuthenticated(true);
        localStorage.setItem('student', JSON.stringify(student));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (studentData: Partial<Student> & { password: string }): Promise<boolean> => {
    try {
      // Create student directly in the new database structure
      const newStudentData = {
        fname: studentData.fname || studentData.fullName?.split(' ')[0] || '',
        mname: studentData.mname || '',
        lname: studentData.lname || studentData.fullName?.split(' ').slice(1).join(' ') || '',
        email: studentData.email,
        dob: studentData.dob || studentData.dateOfBirth || '',
        gender: studentData.gender || 'Other',
        phone: studentData.phone || '',
        address: studentData.address || '',
        student_id: studentData.student_id || '',
        institute_id: studentData.institute_id,
        password: studentData.password,
      };
      
      const response = await apiService.createStudent(newStudentData);
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as any;
        return responseData.success || false;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setStudent(null);
      setIsAuthenticated(false);
      
      // Clear all localStorage items
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies (if any)
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      });
    }
  };

  // Add a function to check authentication status
  const checkAuthStatus = () => {
    const storedStudent = localStorage.getItem('student');
    const authToken = localStorage.getItem('authToken');
    
    if (!storedStudent || !authToken) {
      // Clear state if either is missing
      setStudent(null);
      setIsAuthenticated(false);
      return false;
    }
    
    try {
      const parsedStudent = JSON.parse(storedStudent);
      if (!parsedStudent || !parsedStudent.email) {
        // Invalid student data
        setStudent(null);
        setIsAuthenticated(false);
        return false;
      }
      
      // Restore state if valid
      setStudent(parsedStudent);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error parsing stored student in checkAuthStatus:', error);
      setStudent(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const updateProfile = (data: Partial<Student>) => {
    if (student) {
      const updatedStudent = { ...student, ...data };
      setStudent(updatedStudent);
      localStorage.setItem('student', JSON.stringify(updatedStudent));
    }
  };

  const value: AuthContextType = {
    student,
    isAuthenticated,
    login,
    loginWithOTP,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};