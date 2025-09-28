import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Building2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const InstitutionLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginWithOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpId, setOtpId] = useState("");

  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Send OTP for LOGIN (not registration)
      const response = await apiService.sendInstitutionOTP(email, "Institution", "login");
      const data = response.data as any;
      
      const otpId = data.data?.otp_id || data.otp_id || data.id;
      setOtpId(otpId);
      setStep("otp");
      
      toast({
        title: "OTP Sent! 📧",
        description: `Verification code sent to ${email}. Please check your email inbox.`,
      });
    } catch (error: any) {
      console.log("Error details:", error);
      const errorMessage = error?.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "OTP Send Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
      console.log("Verifying OTP for login with:", { otpId, otp });
      
      const response = await apiService.verifyOTP(otpId, otp);
      const data = response.data as any;
      
      console.log("OTP Verification Response:", data);
      
      if (data.success) {
        // This is LOGIN flow - check if user is already registered
        if (data.role === 'institution') {
          // Check if registration is complete by looking for checkpoint data
          try {
            const checkpointResponse = await apiService.loadRegistrationCheckpoint(email);
            const checkpointData = checkpointResponse.data as any;
            
            if (checkpointData.success && checkpointData.data.step > 0) {
              // Registration is incomplete, redirect to continue registration
              toast({
                title: "Registration Incomplete",
                description: "Please complete your registration process first.",
                variant: "destructive",
              });
              
              // Redirect to registration with the last saved step
              setTimeout(() => {
                navigate("/institution/register");
              }, 2000);
              return;
            }
          } catch (error) {
            // If checkpoint check fails, assume registration is complete
            console.log("Checkpoint check failed, proceeding with login");
          }
          
          // User is registered and registration is complete, proceed with login
          const loginSuccess = await loginWithOTP(data);
          
          if (loginSuccess) {
            toast({
              title: "Login Successful! 🎉",
              description: "Welcome back to your institution dashboard.",
            });
            
            // Redirect to institution dashboard
            navigate("/institution");
          } else {
            throw new Error("Failed to complete login process");
          }
        } else {
          // User is not registered as institution
          toast({
            title: "Not Registered",
            description: "This email is not registered as an institution. Please register first.",
            variant: "destructive",
          });
          
          // Redirect to registration
          setTimeout(() => {
            navigate("/institution/register");
          }, 2000);
        }
      } else {
        throw new Error(data.message || "OTP verification failed");
      }
    } catch (error: any) {
      console.log("OTP Verification Error:", error);
      const errorMessage = error?.message || "Failed to verify OTP";
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

  const handleBack = () => {
    if (step === "otp") {
      setStep("email");
      setOtp("");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Building2 className="h-6 w-6" />
            Institution Login
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to receive a login code"}
            {step === "otp" && "Enter the OTP sent to your email"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Institution Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="institution@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendOtp}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send Login Code"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  OTP sent to: <span className="font-medium">{email}</span>
                </p>
              </div>

              <Button
                onClick={handleVerifyOtp}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Login"}
              </Button>
            </>
          )}

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {step === "email" && (
            <Link 
              to="/institution/register/phase1" 
              className="text-sm text-primary hover:underline font-medium"
            >
                Need to register?
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
