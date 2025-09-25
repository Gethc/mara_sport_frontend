import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, CheckCircle } from "lucide-react";

interface EmailOtpStepProps {
  onComplete: (email: string) => void;
  onBack?: () => void;
  userType?: "student" | "institution";
  purpose?: "login" | "registration";
}

export const EmailOtpStep = ({ onComplete, onBack, userType = "student", purpose = "registration" }: EmailOtpStepProps) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otpAlreadySent, setOtpAlreadySent] = useState(false);
  const { toast } = useToast();
  const { loginWithOTP } = useAuth();

  const handleResendOtp = async () => {
    setOtpAlreadySent(false);
    setError("");
    
    // In development mode, try to clear existing OTP first
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log("🔄 Development mode: Clearing existing OTP for", email);
        await apiService.clearOTPForEmail(email);
        console.log("✅ Cleared existing OTP, proceeding with new OTP");
      } catch (clearError) {
        console.log("⚠️ Could not clear OTP (this is normal in production):", clearError);
        // Continue anyway - the backend will handle duplicate OTPs
      }
    }
    
    await handleSendOtp();
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      let response;
      
      // Use the correct API method based on userType and purpose
      if (userType === "institution") {
        response = await apiService.sendInstitutionOTP(email, "Institution", purpose);
      } else {
        response = await apiService.sendStudentOTP(email, "Student", purpose);
      }
      
      const data = response.data as any;
      
      console.log("OTP Send Response:", response);
      console.log("OTP Send Data:", data);
      console.log("OTP ID from data:", data.otp_id);
      console.log("OTP ID from data.data:", data.data?.otp_id);
      
      // Try to get otp_id from different possible locations
      const otpId = data.data?.otp_id || data.otp_id || data.id;
      console.log("Final OTP ID:", otpId);
      
      setOtpId(otpId);
      setStep("otp");
      
      toast({
        title: "OTP Sent! 📧",
        description: `Verification code sent to ${email}. Please check your email inbox.`,
      });
    } catch (error: any) {
      console.log("Error details:", error);
      console.log("Error message:", error?.message);
      
      // Extract error message from the thrown error
      const errorMessage = error?.message || "";
      
      if (errorMessage.includes("already exists and has completed registration")) {
        toast({
          title: "Registration Already Complete! 🎉",
          description: "Congratulations! Your registration has already been completed successfully. You can now proceed to login and access your account.",
          variant: "default",
        });
        
        // Show a more detailed success message
        setTimeout(() => {
          toast({
            title: "Redirecting to Login... 🔐",
            description: "Taking you to the login page to access your account.",
          });
        }, 1500);
        
        // Redirect to login page after showing success message
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else if (errorMessage.includes("already exists")) {
        // Handle case where email already exists for the wrong user type
        const userTypeText = userType === "institution" ? "institution" : "student";
        toast({
          title: "Email Already Registered",
          description: `This email is already registered as a ${userTypeText === "institution" ? "student" : "institution"}. Please use a different email or try logging in instead.`,
          variant: "destructive",
        });
        setError(`Email already registered as ${userTypeText === "institution" ? "student" : "institution"}`);
      } else if (errorMessage.includes("OTP already sent")) {
        // Handle OTP already sent case
        setOtpAlreadySent(true);
        toast({
          title: "OTP Already Sent! ⏰",
          description: "An OTP has already been sent to this email. You can resend it using the button below, or check your email inbox.",
          variant: "destructive",
        });
        setError("OTP already sent. You can resend it or check your email inbox.");
      } else {
        setError("Failed to send OTP. Please try again.");
        toast({
          title: "Error",
          description: errorMessage || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      console.log("Verifying OTP with:", { otpId, otp, email });
      
      let response;
      let data;
      
      // Always use the apiService.verifyOTP method for consistency
      if (otpId) {
        response = await apiService.verifyOTP(otpId, otp);
        data = response.data as any;
      } else {
        // If no otpId, use email-based verification
        response = await apiService.verifyOTPWithEmail(email, otp);
        data = response.data as any;
      }
      
      console.log("OTP Verification Response:", data);
      console.log("Purpose:", purpose);
      console.log("UserType:", userType);
      console.log("Data role:", data.role);
      console.log("Data email:", data.email);
      
      if (data.success) {
        if (purpose === "login") {
          // This is LOGIN flow - check if user is already registered
          if (data.role === 'institution') {
            // User is registered, proceed with login
            const loginSuccess = await loginWithOTP(data);
            
            if (loginSuccess) {
              toast({
                title: "Login Successful! 🎉",
                description: "Welcome back to your institution dashboard.",
              });
              
              // Redirect to appropriate dashboard
              setTimeout(() => {
                window.location.href = userType === 'institution' ? '/institution' : '/dashboard';
              }, 1500);
              return;
            } else {
              throw new Error("Failed to complete login process");
            }
          } else {
            // User is not registered
            toast({
              title: "Not Registered",
              description: `This email is not registered as a ${userType}. Please register first.`,
              variant: "destructive",
            });
            
            // Redirect to registration
            setTimeout(() => {
              window.location.href = userType === 'institution' ? '/institution/register/phase1' : '/register';
            }, 2000);
            return;
          }
        } else {
          // This is REGISTRATION flow - always continue with registration
          // Even if the email is already registered, we proceed with registration
          // (this allows updating details or re-registering)
          console.log("Registration flow - proceeding with onComplete");
          console.log("Email role from backend:", data.role);
          console.log("Email from backend:", data.email);
          console.log("Continuing with registration regardless of existing registration");
          
          toast({
            title: "Email Verified ✅",
            description: "Your email has been successfully verified. Please continue with registration.",
          });
          
          // Proceed with registration flow
          onComplete(email);
        }
      } else {
        throw new Error(data.message || "OTP verification failed");
      }
    } catch (error: any) {
      console.log("OTP Verification Error:", error);
      console.log("Error response:", error?.response);
      console.log("Error data:", error?.response?.data);
      
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to verify OTP";
      setError(errorMessage);
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Registration
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to get started"}
            {step === "otp" && "Enter the OTP sent to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
              {otpAlreadySent && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Sending..." : "Resend OTP"}
                  </Button>
                </div>
              )}
            </Alert>
          )}

          {step === "email" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button 
                  onClick={handleSendOtp} 
                  className="flex-1 bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  OTP sent to {email}. Check your email for the verification code.
                </p>
              </div>
              <Button 
                onClick={handleVerifyOtp} 
                className="w-full bg-gradient-primary"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep("email")}
                className="w-full"
              >
                Back to Email
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};