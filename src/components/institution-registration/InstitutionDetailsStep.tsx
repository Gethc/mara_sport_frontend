import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Mail, Phone, User, Globe, UserCheck, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { INSTITUTE_TYPES, getInstituteOptions } from "@/lib/institutionData";
import { apiService } from "@/services/api";
import { 
  validateEmailWithDetails, 
  normalizePhoneNumber
} from "@/lib/validation";

interface InstitutionDetailsStepProps {
  initialData?: any;
  verificationStatus: {
    institutionEmailVerified: boolean;
    contactPersonEmailVerified: boolean;
  };
  onComplete: (data: any) => void;
  onVerificationChange: (status: any) => void;
  onBack?: () => void;
}

// Institution types are now imported from shared constants

export const InstitutionDetailsStep = ({ 
  initialData, 
  verificationStatus, 
  onComplete, 
  onVerificationChange, 
  onBack 
}: InstitutionDetailsStepProps) => {
  
  // Debug logging
  console.log("InstitutionDetailsStep received initialData:", initialData);
  console.log("InstitutionDetailsStep received verificationStatus:", verificationStatus);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    institutionName: initialData?.institutionName || "",
    institutionEmail: initialData?.institutionEmail || "",
    institutionType: initialData?.institutionType || "",
    phoneNumber: initialData?.phoneNumber || "",
    website: initialData?.website || "",
    principalName: initialData?.principalName || "",
    principalContact: initialData?.principalContact || "",
    contactPersonName: initialData?.contactPersonName || "",
    contactPersonDesignation: initialData?.contactPersonDesignation || "",
    contactPersonPhone: initialData?.contactPersonPhone || "",
    contactPersonEmail: initialData?.contactPersonEmail || "",
  });

  // New state for email verification
  const [emailVerification, setEmailVerification] = useState({
    institutionEmail: {
      sent: false,
      otp: "",
      verified: verificationStatus.institutionEmailVerified,
      loading: false
    },
    contactPersonEmail: {
      sent: false,
      otp: "",
      verified: verificationStatus.contactPersonEmailVerified,
      loading: false
    }
  });

  // Option to use same email as institution
  const [useSameEmail, setUseSameEmail] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [instituteTypes, setInstituteTypes] = useState(INSTITUTE_TYPES);
  const [loadingInstituteTypes, setLoadingInstituteTypes] = useState(true);

  // Update emailVerification when verificationStatus changes
  useEffect(() => {
    setEmailVerification(prev => ({
      institutionEmail: { 
        ...prev.institutionEmail, 
        verified: verificationStatus.institutionEmailVerified 
      },
      contactPersonEmail: { 
        ...prev.contactPersonEmail, 
        verified: verificationStatus.contactPersonEmailVerified 
      },
    }));
  }, [verificationStatus]);

  // Handle same email checkbox
  useEffect(() => {
    if (useSameEmail) {
      setFormData(prev => ({
        ...prev,
        contactPersonEmail: prev.institutionEmail
      }));
    }
  }, [useSameEmail, formData.institutionEmail]);

  // Load institute types from API on component mount
  useEffect(() => {
    const loadInstituteTypes = async () => {
      try {
        const response = await apiService.getInstituteTypes();
        if (response.data.success) {
          setInstituteTypes(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load institute types:", error);
        // Keep default institute types as fallback
        toast({
          title: "Warning",
          description: "Failed to load institute types from server. Using default options.",
          variant: "destructive",
        });
      } finally {
        setLoadingInstituteTypes(false);
      }
    };

    loadInstituteTypes();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  // New email verification functions
  const sendEmailVerification = async (emailType: 'institutionEmail' | 'contactPersonEmail') => {
    const email = emailType === 'institutionEmail' ? formData.institutionEmail : formData.contactPersonEmail;
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address first.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setEmailVerification(prev => ({
      ...prev,
      [emailType]: { ...prev[emailType], loading: true }
    }));

    try {
      const emailTypeForAPI = emailType === 'institutionEmail' ? 'institution' : 'contact_person';
      const response = await apiService.sendEmailVerification(email, emailTypeForAPI);
      
      if (response.data && response.data.success) {
        setEmailVerification(prev => ({
          ...prev,
          [emailType]: { ...prev[emailType], sent: true, loading: false }
        }));
        
        toast({
          title: "Verification Code Sent! 📧",
          description: `A 6-digit verification code has been sent to ${email}`,
        });
      } else {
        throw new Error(response.data?.message || "Failed to send verification code");
      }
    } catch (error: any) {
      console.error('Email verification send failed:', error);
      setEmailVerification(prev => ({
        ...prev,
        [emailType]: { ...prev[emailType], loading: false }
      }));
      
      toast({
        title: "Failed to Send Code",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const verifyEmailCode = async (emailType: 'institutionEmail' | 'contactPersonEmail') => {
    const email = emailType === 'institutionEmail' ? formData.institutionEmail : formData.contactPersonEmail;
    const otp = emailVerification[emailType].otp;
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setEmailVerification(prev => ({
      ...prev,
      [emailType]: { ...prev[emailType], loading: true }
    }));

    try {
      const emailTypeForAPI = emailType === 'institutionEmail' ? 'institution' : 'contact_person';
      const response = await apiService.verifyEmailVerification(email, otp, emailTypeForAPI);
      
      if (response.data && response.data.success) {
        setEmailVerification(prev => ({
          ...prev,
          [emailType]: { ...prev[emailType], verified: true, loading: false, otp: "" }
        }));

        // Update verification status
        const newVerificationStatus = {
          institutionEmailVerified: emailType === 'institutionEmail' ? true : verificationStatus.institutionEmailVerified,
          contactPersonEmailVerified: emailType === 'contactPersonEmail' ? true : verificationStatus.contactPersonEmailVerified,
        };
        
        // If institution email is verified and "same email" is checked, auto-verify contact person email
        if (emailType === 'institutionEmail' && useSameEmail) {
          newVerificationStatus.contactPersonEmailVerified = true;
          setEmailVerification(prev => ({
            ...prev,
            contactPersonEmail: { ...prev.contactPersonEmail, verified: true }
          }));
        }
        
        onVerificationChange(newVerificationStatus);
        
        toast({
          title: "Email Verified! ✅",
          description: `${email} has been successfully verified.`,
        });
      } else {
        throw new Error(response.data?.message || "Invalid verification code");
      }
    } catch (error: any) {
      console.error('Email verification failed:', error);
      setEmailVerification(prev => ({
        ...prev,
        [emailType]: { ...prev[emailType], loading: false }
      }));
      
      toast({
        title: "Verification Failed",
        description: error.message || "Please check your code and try again.",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    // Institution name validation
    if (!formData.institutionName || formData.institutionName.trim().length < 2) {
      newErrors.push("Institution name must be at least 2 characters");
    }
    
    // Institution email validation
    const institutionEmailValidation = validateEmailWithDetails(formData.institutionEmail);
    if (!institutionEmailValidation.isValid) {
      newErrors.push(`Institution Email: ${institutionEmailValidation.errorMessage}`);
    }
    
    if (!formData.institutionType) newErrors.push("Institution Type is required");
    
    // Institution phone validation - only check length
    if (!formData.phoneNumber || formData.phoneNumber.trim().length < 10) {
      newErrors.push("Institution phone number must be at least 10 digits");
    }
    
    // Principal name validation
    if (!formData.principalName || formData.principalName.trim().length < 2) {
      newErrors.push("Principal name must be at least 2 characters");
    }
    
    // Principal contact validation - only check length
    if (!formData.principalContact || formData.principalContact.trim().length < 10) {
      newErrors.push("Principal contact number must be at least 10 digits");
    }
    
    // Contact person name validation
    if (!formData.contactPersonName || formData.contactPersonName.trim().length < 2) {
      newErrors.push("Contact person name must be at least 2 characters");
    }
    
    // Contact person designation validation
    if (!formData.contactPersonDesignation || formData.contactPersonDesignation.trim().length < 2) {
      newErrors.push("Contact person designation must be at least 2 characters");
    }
    
    // Contact person phone validation - only check length
    if (!formData.contactPersonPhone || formData.contactPersonPhone.trim().length < 10) {
      newErrors.push("Contact person phone number must be at least 10 digits");
    }
    
    // Contact person email validation (required)
    if (!formData.contactPersonEmail) {
      newErrors.push("Contact person email is required");
    } else {
      const contactPersonEmailValidation = validateEmailWithDetails(formData.contactPersonEmail);
      if (!contactPersonEmailValidation.isValid) {
        newErrors.push(`Contact Person Email: ${contactPersonEmailValidation.errorMessage}`);
      }
    }
    
    // Contact person email verification (required)
    if (!emailVerification.contactPersonEmail.verified) {
      if (useSameEmail && emailVerification.institutionEmail.verified) {
        // If using same email and institution email is verified, contact person email is automatically verified
        // This case is handled in the verification logic above
      } else {
        newErrors.push("Contact person email must be verified");
      }
    }
    
    // Website validation (optional but if provided, should be valid)
    if (formData.website && formData.website.trim()) {
      const websiteRegex = /^https?:\/\/.+\..+/;
      if (!websiteRegex.test(formData.website.trim())) {
        newErrors.push("Website must be a valid URL (e.g., https://www.example.com)");
      }
    }
    
    // Email verification requirements - now mandatory
    if (!verificationStatus.institutionEmailVerified) {
      newErrors.push("Institution email must be verified");
    }
    if (!verificationStatus.contactPersonEmailVerified) {
      newErrors.push("Contact person email must be verified");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Validate email uniqueness before proceeding
    try {
      toast({
        title: "Validating Email",
        description: "Checking if email is available for registration...",
      });
      
      const response = await apiService.validateRegistrationEmail(formData.institutionEmail);
      
      if (response.data?.success) {
        toast({
          title: "Email Available",
          description: "Email validated successfully. Proceeding with registration.",
        });
        onComplete(formData);
      } else {
        throw new Error(response.data?.message || "Email validation failed");
      }
    } catch (error: any) {
      console.error('Email validation failed:', error);
      
      let errorMessage = "Failed to validate email. Please try again.";
      
      // Check if it's an email conflict error
      if (error.response?.status === 409 || error.message?.includes('already registered')) {
        errorMessage = `Email '${formData.institutionEmail}' is already registered. Please use a different email address or contact support if you believe this is an error.`;
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Institution Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Institution Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institutionType">Institute Type *</Label>
              <Select 
                value={formData.institutionType} 
                onValueChange={(value) => {
                  handleInputChange("institutionType", value);
                  // Reset institution name when type changes
                  handleInputChange("institutionName", "");
                }}
                disabled={loadingInstituteTypes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingInstituteTypes ? "Loading types..." : "Select institute type"} />
                </SelectTrigger>
                <SelectContent>
                  {instituteTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionName">Institute Name *</Label>
              {formData.institutionType === "Other" ? (
                <Input
                  id="institutionName"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange("institutionName", e.target.value)}
                  placeholder="Enter institute name"
                />
              ) : (
                <Select 
                  value={formData.institutionName} 
                  onValueChange={(value) => handleInputChange("institutionName", value)}
                  disabled={!formData.institutionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select institute name" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {getInstituteOptions(formData.institutionType).map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institutionEmail">Institution Email *</Label>
            <div className="flex gap-2">
              <Input
                id="institutionEmail"
                type="email"
                value={formData.institutionEmail}
                onChange={(e) => handleInputChange("institutionEmail", e.target.value)}
                placeholder="school@example.com"
                disabled={emailVerification.institutionEmail.verified}
              />
              {!emailVerification.institutionEmail.verified && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => sendEmailVerification('institutionEmail')}
                  disabled={emailVerification.institutionEmail.sent || emailVerification.institutionEmail.loading}
                >
                  {emailVerification.institutionEmail.loading ? "Sending..." : 
                   emailVerification.institutionEmail.sent ? "Sent" : "Verify"}
                </Button>
              )}
              {emailVerification.institutionEmail.verified && (
                <Button variant="outline" disabled className="text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {emailVerification.institutionEmail.sent && !emailVerification.institutionEmail.verified && (
            <div className="space-y-2">
              <Label htmlFor="institutionEmailOtp">Enter Verification Code</Label>
              <div className="flex gap-2">
                <Input
                  id="institutionEmailOtp"
                  value={emailVerification.institutionEmail.otp}
                  onChange={(e) => setEmailVerification(prev => ({
                    ...prev,
                    institutionEmail: { ...prev.institutionEmail, otp: e.target.value }
                  }))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <Button 
                  onClick={() => verifyEmailCode('institutionEmail')}
                  disabled={emailVerification.institutionEmail.loading}
                >
                  {emailVerification.institutionEmail.loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                const normalized = normalizePhoneNumber(e.target.value);
                handleInputChange("phoneNumber", normalized);
              }}
              onKeyDown={(e) => {
                // Only allow numbers, backspace, delete, tab, escape, enter, and arrow keys
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="0712345678"
            />
          </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="www.schoolname.ac.ke"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principalName">Principal Name *</Label>
              <Input
                id="principalName"
                value={formData.principalName}
                onChange={(e) => handleInputChange("principalName", e.target.value)}
                placeholder="Dr. John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalContact">Principal Contact Number <span className="text-red-500">*</span></Label>
              <Input
                id="principalContact"
                type="tel"
                value={formData.principalContact}
                onChange={(e) => {
                  const normalized = normalizePhoneNumber(e.target.value);
                  handleInputChange("principalContact", normalized);
                }}
                onKeyDown={(e) => {
                  // Only allow numbers, backspace, delete, tab, escape, enter, and arrow keys
                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="0712345678"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Person Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Contact Person Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPersonName">Name *</Label>
              <Input
                id="contactPersonName"
                value={formData.contactPersonName}
                onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPersonDesignation">Designation *</Label>
              <Input
                id="contactPersonDesignation"
                value={formData.contactPersonDesignation}
                onChange={(e) => handleInputChange("contactPersonDesignation", e.target.value)}
                placeholder="Sports Coordinator"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPersonPhone">Contact Number <span className="text-red-500">*</span></Label>
              <Input
                id="contactPersonPhone"
                type="tel"
                value={formData.contactPersonPhone}
                onChange={(e) => {
                  const normalized = normalizePhoneNumber(e.target.value);
                  handleInputChange("contactPersonPhone", normalized);
                }}
                onKeyDown={(e) => {
                  // Only allow numbers, backspace, delete, tab, escape, enter, and arrow keys
                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="0712345678"
              />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPersonEmail">Email *</Label>
            
            {/* Same email checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useSameEmail"
                checked={useSameEmail}
                onChange={(e) => setUseSameEmail(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useSameEmail" className="text-sm text-muted-foreground">
                Use same email as institution
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Input
                id="contactPersonEmail"
                type="email"
                value={formData.contactPersonEmail}
                onChange={(e) => handleInputChange("contactPersonEmail", e.target.value)}
                placeholder="coordinator@school.com"
                disabled={emailVerification.contactPersonEmail.verified || useSameEmail}
              />
              {!emailVerification.contactPersonEmail.verified && !useSameEmail && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => sendEmailVerification('contactPersonEmail')}
                  disabled={emailVerification.contactPersonEmail.sent || emailVerification.contactPersonEmail.loading}
                >
                  {emailVerification.contactPersonEmail.loading ? "Sending..." : 
                   emailVerification.contactPersonEmail.sent ? "Sent" : "Verify"}
                </Button>
              )}
              {emailVerification.contactPersonEmail.verified && (
                <Button variant="outline" disabled className="text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {useSameEmail && (
              <p className="text-sm text-muted-foreground">
                Contact person email will be verified automatically when institution email is verified.
              </p>
            )}
          </div>

          {emailVerification.contactPersonEmail.sent && !emailVerification.contactPersonEmail.verified && !useSameEmail && (
            <div className="space-y-2">
              <Label htmlFor="contactPersonEmailOtp">Enter Verification Code</Label>
              <div className="flex gap-2">
                <Input
                  id="contactPersonEmailOtp"
                  value={emailVerification.contactPersonEmail.otp}
                  onChange={(e) => setEmailVerification(prev => ({
                    ...prev,
                    contactPersonEmail: { ...prev.contactPersonEmail, otp: e.target.value }
                  }))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <Button 
                  onClick={() => verifyEmailCode('contactPersonEmail')}
                  disabled={emailVerification.contactPersonEmail.loading}
                >
                  {emailVerification.contactPersonEmail.loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button onClick={handleSubmit} className={!onBack ? "w-full" : ""}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};