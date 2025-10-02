import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminSession {
  email: string;
  role: string;
}

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const adminSession = localStorage.getItem('adminSession');
        const authToken = localStorage.getItem('authToken');
        
        if (!adminSession || !authToken) {
          console.log('Missing admin session or auth token');
          toast({
            title: "Access Denied",
            description: "Please log in as an admin to access this page.",
            variant: "destructive",
          });
          setIsAuthorized(false);
          return;
        }

        const session: AdminSession = JSON.parse(adminSession);
        if (session.role !== 'admin') {
          console.log('Invalid admin role');
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges to access this page.",
            variant: "destructive",
          });
          setIsAuthorized(false);
          return;
        }

        // Temporarily skip API verification since backend auth is disabled for testing
        console.log('Skipping API verification - backend auth temporarily disabled');
        setIsAuthorized(true);
        
        // TODO: Re-enable API verification when backend authentication is restored
        /*
        // Verify token is still valid by making a test API call
        try {
          // Old network URL (commented out)
          // const response = await fetch('http://192.168.1.45:8000/api/v1/admin/dashboard/stats', {
          
          // Local backend URL
          const response = await fetch('http://localhost:8000/api/v1/admin/dashboard/stats', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            console.log('Admin access verified');
            setIsAuthorized(true);
          } else if (response.status === 401) {
            console.log('Token expired or invalid');
            // Clear invalid tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('adminSession');
            localStorage.removeItem('student');
            toast({
              title: "Session Expired",
              description: "Your admin session has expired. Please log in again.",
              variant: "destructive",
            });
            setIsAuthorized(false);
          } else {
            console.log('API call failed with status:', response.status);
            toast({
              title: "Authentication Error",
              description: "Failed to verify admin access. Please log in again.",
              variant: "destructive",
            });
            setIsAuthorized(false);
          }
        } catch (apiError) {
          console.error('API verification failed:', apiError);
          toast({
            title: "Connection Error",
            description: "Unable to verify admin access. Please check your connection.",
            variant: "destructive",
          });
          setIsAuthorized(false);
        }
        */
      } catch (error) {
        console.error('Error checking admin access:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify admin access. Please log in again.",
          variant: "destructive",
        });
        setIsAuthorized(false);
      }
    };

    checkAdminAccess();
  }, [toast]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/login" replace />;
};