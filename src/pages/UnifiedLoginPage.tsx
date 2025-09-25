import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Mail, Lock, Eye, EyeOff, Trophy, Shield, Building2, User } from "lucide-react";
import sportsHero from "@/assets/sports-hero.jpg";

type UserRole = 'student' | 'institution' | 'admin';

const UnifiedLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithOTP } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  // Set default role based on URL path
  useEffect(() => {
    if (location.pathname === '/login') {
      setSelectedRole('student');
    }
  }, [location.pathname]);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [otpId, setOtpId] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setStep('email'); // Reset to email step when role changes
    setFormData({ email: "", password: "", otp: "" }); // Clear form
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (selectedRole === 'admin') {
        // Admin login with email + password
        const success = await login(formData.email, formData.password);
        
        if (success) {
          // Store admin session (this is also done in AuthContext, but keeping for redundancy)
          localStorage.setItem('adminSession', JSON.stringify({ email: formData.email, role: 'admin' }));
          
          toast({
            title: "Welcome Back!",
            description: "Successfully logged into admin portal.",
          });
          
          // Navigate to admin dashboard
          navigate("/admin");
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid admin credentials. Please try again.",
            variant: "destructive",
          });
          // Don't navigate - stay on login page
          return;
        }
      } else {
        // Student & Institution - Send OTP
        try {
          let response;
          if (selectedRole === 'student') {
            response = await apiService.sendStudentOTP(formData.email, "Student", "login");
          } else {
            response = await apiService.sendInstitutionOTP(formData.email, "Institution", "login");
          }
          
          if (response.data) {
            const data = response.data as any;
            setOtpId(data.data?.otp_id || data.otp_id);
            
            toast({
              title: "OTP Sent! 📧",
              description: `Verification code sent to ${formData.email}. Please check your email inbox.`,
            });
            
            setStep('otp');
          } else {
            throw new Error('Failed to send OTP');
          }
        } catch (error) {
          console.error('OTP send failed:', error);
          
          // Extract the actual error message from the backend
          const errorMessage = error instanceof Error ? error.message : "Failed to send OTP. Please try again.";
          
          toast({
            title: "OTP Send Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      // Extract the actual error message from the backend
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      
      toast({
        title: selectedRole === 'admin' ? "Login Error" : "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Verify OTP with backend
      const response = await apiService.verifyOTP(otpId, formData.otp);
      
      if (response.data) {
        const data = response.data as any;
        
        // Use AuthContext to handle OTP-based login
        const success = await loginWithOTP(data);
        
        if (success) {
          const roleMessages = {
            student: "Welcome to your student dashboard!",
            institution: "Welcome to your institution dashboard.",
          };
          
          const redirectPaths = {
            student: "/dashboard",
            institution: "/institution",
          };
          
          toast({
            title: "Login Successful!",
            description: roleMessages[selectedRole as 'student' | 'institution'],
          });
          
          navigate(redirectPaths[selectedRole as 'student' | 'institution']);
        } else {
          toast({
            title: "Login Failed",
            description: "Failed to complete login process. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      
      // Extract the actual error message from the backend
      const errorMessage = error instanceof Error ? error.message : "Please check your code and try again.";
      
      toast({
        title: "OTP Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield className="h-5 w-5" />;
      case 'institution': return <Building2 className="h-5 w-5" />;
      case 'student': return <User className="h-5 w-5" />;
    }
  };

  const getRoleTitle = () => {
    switch (selectedRole) {
      case 'admin': return 'Admin Portal';
      case 'institution': return 'Institution Portal';
      case 'student': return 'Student Portal';
    }
  };

  const getRoleDescription = () => {
    if (step === 'otp') {
      return 'Enter the verification code sent to your email';
    }
    
    switch (selectedRole) {
      case 'admin': return 'Enter your credentials to access admin panel';
      case 'institution': return 'Enter your email to receive an OTP';
      case 'student': return 'Enter your email to receive an OTP';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Hero Section */}
          <div className="text-center md:text-left space-y-6">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-6">
              <Trophy className="h-8 w-8 text-primary-glow" />
              <span className="text-2xl font-bold text-white">Sports Portal</span>
            </div>
            
            <div className="relative">
              <img 
                src={sportsHero} 
                alt="Sports Event Management" 
                className="rounded-2xl shadow-large w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                <div className="text-white text-center px-6">
                  <div className="mb-4">
                    {getRoleIcon(selectedRole)}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {getRoleTitle()}
                  </h1>
                  <p className="text-xl opacity-90 mb-4">
                    {selectedRole === 'admin' && 'System Administration'}
                    {selectedRole === 'institution' && 'Manage your sports events effortlessly'}
                    {selectedRole === 'student' && 'Access your sports event dashboard'}
                  </p>
                  <div className="flex justify-center space-x-4 text-sm opacity-80">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-glow rounded-full"></div>
                      <span>
                        {selectedRole === 'admin' && 'Full Control'}
                        {selectedRole === 'institution' && 'Event Management'}
                        {selectedRole === 'student' && 'Event Registration'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-glow rounded-full"></div>
                      <span>
                        {selectedRole === 'admin' && 'Analytics'}
                        {selectedRole === 'institution' && 'Student Management'}
                        {selectedRole === 'student' && 'Live Updates'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <Card className="shadow-large border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {step === 'otp' ? 'Verify OTP' : 'Sign In'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {getRoleDescription()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Role Selection */}
              {step === 'email' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Your Role</Label>
                  <RadioGroup 
                    value={selectedRole} 
                    onValueChange={(value) => handleRoleChange(value as UserRole)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg hover:bg-muted transition-colors">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="flex items-center space-x-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Student</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg hover:bg-muted transition-colors">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin" className="flex items-center space-x-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Admin</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Login Forms */}
              {step === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={`Enter your ${selectedRole} email`}
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field only for admin */}
                  {selectedRole === 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Admin-specific options */}
                  {selectedRole === 'admin' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(!!checked)}
                        />
                        <Label htmlFor="remember" className="text-sm cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      
                      <Link 
                        to="#" 
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    disabled={loading}
                  >
                    {loading 
                      ? (selectedRole === 'admin' ? "Signing In..." : "Sending OTP...") 
                      : (selectedRole === 'admin' ? "Sign In" : "Send OTP")
                    }
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      OTP sent to: <span className="font-medium">{formData.email}</span>
                    </p>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Enter 6-digit OTP from email"
                        value={formData.otp}
                        onChange={(e) => handleInputChange("otp", e.target.value)}
                        className="pl-10 text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('email')}
                    className="w-full"
                  >
                    Back to Email
                  </Button>
                </form>
              )}

              {/* Demo credentials for admin */}
              {selectedRole === 'admin' && step === 'email' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    {/* <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Demo Credentials</span>
                    </div> */}
                  </div>

                  {/* <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Admin portal access credentials</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Email:</strong> admin1@gmail.com</p>
                      <p><strong>Password:</strong> admin123</p>
                    </div> */}
                  {/* </div> */}
                </>
              )}

              {/* Registration links */}
              {step === 'email' && (
                <div className="text-center text-sm space-y-2">
                  <div>
                    <span className="text-muted-foreground">Don't have an account? </span>
                    {selectedRole === 'student' && (
                      <Link to="/register" className="text-primary hover:underline font-medium">
                        Register Now
                      </Link>
                    )}
                    {selectedRole === 'admin' && (
                      <span className="text-muted-foreground">Contact system administrator</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Institution? 
                    <Link to="/institution/login" className="text-primary hover:underline font-medium ml-1">
                      Login
                    </Link>
                    {" or "}
                    <Link to="/institution/register/phase1" className="text-primary hover:underline font-medium">
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginPage;