import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import { NewRegisterPage } from "./pages/NewRegisterPage";
import { InstitutionLoginPage } from "./pages/InstitutionLoginPage";
import UnifiedLoginPage from "./pages/UnifiedLoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ProfilePage from "./pages/dashboard/ProfilePage";
import SportsRegistrationPage from "./pages/dashboard/SportsRegistrationPage";
import GuardianInfoPage from "./pages/dashboard/GuardianInfoPage";
import MedicalInfoPage from "./pages/dashboard/MedicalInfoPage";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import ConsentPage from "./pages/dashboard/ConsentPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import NotFound from "./pages/NotFound";

// Institution Panel
import InstitutionLayout from "./layouts/InstitutionLayout";
import InstitutionRegisterPage from "./pages/institution/InstitutionRegisterPage";
import { NewInstitutionRegisterPage } from "./pages/NewInstitutionRegisterPage";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import InstitutionStudentManagement from "./pages/institution/InstitutionStudentManagement";
import InstitutionSportsManagement from "./pages/institution/InstitutionSportsManagement";
import InstitutionPayments from "./pages/institution/InstitutionPayments";
import InstitutionProfile from "./pages/institution/InstitutionProfile";
import StudentPaymentPage from "./pages/StudentPaymentPage";
import StudentLoginPage from "./pages/StudentLoginPage";

// Admin Panel
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInstitutions from "./pages/admin/AdminInstitutions";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminSponsorships from "./pages/admin/AdminSponsorships";
import AdminSports from "./pages/admin/AdminSports";
import SportDetails from "./pages/admin/SportDetails";
import StudentDetailsPage from "./pages/admin/StudentDetailsPage";
import PaymentDetailsPage from "./pages/admin/PaymentDetailsPage";
import InstitutionDetailsPage from "./pages/admin/InstitutionDetailsPage";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { InstitutionProtectedRoute } from "./components/InstitutionProtectedRoute";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return children;
  }
  
  // Check user role and redirect accordingly
  
 
  
  // Default redirect for students
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={
              <PublicRoute>
                <NewRegisterPage />
              </PublicRoute>
            } />
            <Route path="/register-old" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <UnifiedLoginPage />
              </PublicRoute>
            } />
            <Route path="/student-payment/:studentId" element={<StudentPaymentPage />} />
            <Route path="/student-login" element={<StudentLoginPage />} />
            
            {/* Student Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="sports-registration" element={<SportsRegistrationPage />} />
              <Route path="guardian-info" element={<GuardianInfoPage />} />
              <Route path="medical-info" element={<MedicalInfoPage />} />
              <Route path="student-payments" element={<PaymentsPage />} />
              <Route path="consent" element={<ConsentPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Institution Panel Routes */}
            <Route path="/institution/register" element={<NewInstitutionRegisterPage />} />
            <Route path="/institution/register/phase1" element={<NewInstitutionRegisterPage />} />
            <Route path="/institution/register-old" element={<InstitutionRegisterPage />} />
            <Route path="/institution/login" element={
              <PublicRoute>
                <InstitutionLoginPage />
              </PublicRoute>
            } />
            <Route path="/institution" element={
              <InstitutionProtectedRoute>
                <InstitutionLayout />
              </InstitutionProtectedRoute>
            }>
              <Route index element={<InstitutionDashboard />} />
              <Route path="profile" element={<InstitutionProfile />} />
              <Route path="institution-students" element={<InstitutionStudentManagement />} />
              <Route path="institution-sports" element={<InstitutionSportsManagement />} />
              <Route path="institution-payments" element={<InstitutionPayments />} />
            </Route>

            {/* Admin Panel Routes - Protected */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="admin-institutions" element={<AdminInstitutions />} />
              <Route path="admin-students" element={<AdminStudents />} />
              <Route path="admin-payments" element={<AdminPayments />} />
              <Route path="admin-invoices" element={<AdminInvoices />} />
              <Route path="admin-sponsorships" element={<AdminSponsorships />} />
              <Route path="admin-sports" element={<AdminSports />} />
              <Route path="admin-sports/:id" element={<SportDetails />} />
              <Route path="admin-students/:studentId" element={<StudentDetailsPage />} />
              <Route path="admin-institutions/:institutionId" element={<InstitutionDetailsPage />} />
              <Route path="payment-details/:paymentType/:paymentId" element={<PaymentDetailsPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;