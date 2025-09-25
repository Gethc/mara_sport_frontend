import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Building2, Mail, Phone, Globe, User, MapPin, GraduationCap, CheckCircle } from "lucide-react";
import sportsHero from "@/assets/sports-hero.jpg";

const InstitutionRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpId, setOtpId] = useState("");
  
  const [formData, setFormData] = useState({
    // Basic Information
    institutionName: "",
    customInstitutionName: "",
    institutionType: "",
    registrationNumber: "",
    accreditationBody: "",
    accreditationNumber: "",
    establishedYear: "",
    
    // Contact Information
    phone: "",
    email: "",
    website: "",
    alternateEmail: "",
    alternatePhone: "",
    
    // Address Information
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    landmark: "",
    
    // Institution Details
    description: "",
    vision: "",
    mission: "",
    specializations: "",
    languagesOffered: "",
    
    // Capacity & Staff
    totalStudents: "",
    totalStaff: "",
    teachingStaff: "",
    nonTeachingStaff: "",
    sportsCoaches: "",
    
    // Facilities
    hasSportsFacilities: false,
    sportsFacilities: "",
    hasLibrary: false,
    libraryCapacity: "",
    hasLaboratory: false,
    laboratoryTypes: "",
    hasHostel: false,
    hostelCapacity: "",
    hasCafeteria: false,
    hasTransport: false,
    transportDetails: "",
    
    // Financial Information
    annualFee: "",
    feeStructure: "",
    paymentMethods: "",
    scholarshipAvailable: false,
    scholarshipDetails: "",
    
    // Contact Person Details
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    contactPersonAlternatePhone: "",
    
    // Additional Contacts
    principalName: "",
    principalPhone: "",
    principalEmail: "",
    sportsDirectorName: "",
    sportsDirectorPhone: "",
    sportsDirectorEmail: "",
    
    // Social Media & Online Presence
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    
    // Documents & Certifications
    hasRegistrationCertificate: false,
    hasAccreditationCertificate: false,
    hasTaxExemption: false,
    taxExemptionNumber: "",
    
    // Sports Specific
    sportsParticipation: "",
    previousAchievements: "",
    coachingStaff: "",
    equipmentAvailable: "",
    trainingSchedule: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendOTP = async () => {
    if (!formData.contactPersonEmail) {
      toast({
        title: "Email Required",
        description: "Please enter contact person email first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiService.sendInstitutionOTP(formData.contactPersonEmail, formData.contactPersonName || "Institution", "registration");
      const data = response.data as any;
      
      setOtpId(data.data?.otp_id || data.otp_id);
      setOtpSent(true);
      
      toast({
        title: "OTP Sent! 📧",
        description: `Verification code sent to ${formData.contactPersonEmail}. Please check your email inbox.`,
      });
    } catch (error) {
      // Extract the actual error message from the backend
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      
      toast({
        title: "OTP Send Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleOtpVerification = async () => {
    if (!otpCode) {
      toast({
        title: "OTP Required",
        description: "Please enter the OTP code.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiService.verifyOTP(otpId, otpCode);
      const data = response.data as any;
      
      setEmailVerified(true);
      setOtpSent(false);
      
      toast({
        title: "Email Verified ✅",
        description: "Your email has been successfully verified.",
      });
    } catch (error) {
      // Extract the actual error message from the backend
      const errorMessage = error instanceof Error ? error.message : "Please check the OTP code and try again.";
      
      toast({
        title: "OTP Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if email is verified
      if (!emailVerified) {
        toast({
          title: "Email Verification Required",
          description: "Please verify your email before submitting the registration.",
          variant: "destructive",
        });
        return;
      }

      // Prepare institute data for API
      const instituteData = {
        name: formData.institutionName || formData.customInstitutionName,
        email: formData.contactPersonEmail,
        type: formData.institutionType,
        // Contact person information
        contactPersonName: formData.contactPersonName,
        contactPersonEmail: formData.contactPersonEmail,
        contactPersonPhone: formData.contactPersonPhone,
        contactPersonDesignation: formData.contactPersonDesignation,
        // Institute information
        phone: formData.phone,
        website: formData.website,
        principalName: formData.principalName,
        principalPhone: formData.principalPhone,
        // Address information
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        // Additional information
        description: formData.description,
        vision: formData.vision,
        mission: formData.mission
      };

      // Create institute via API
      const response = await apiService.createInstitute(instituteData);
      
      if (response.data && response.data.success) {
        toast({
          title: "Registration Successful!",
          description: "Your institution has been registered successfully.",
        });
        
        navigate("/institution/login");
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Hero Section */}
          <div className="text-center md:text-left space-y-6">
            <div className="relative">
              <img 
                src={sportsHero} 
                alt="Institution Registration" 
                className="rounded-2xl shadow-large w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                <div className="text-white text-center">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Register Your Institution</h1>
                  <p className="text-xl opacity-90">Join our sports management platform</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="shadow-large border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Institution Registration
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create your comprehensive institution profile
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Institution Name *</Label>
                      <Select value={formData.institutionName} onValueChange={(value) => handleInputChange("institutionName", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Institution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Delhi Public School">Delhi Public School</SelectItem>
                          <SelectItem value="Ryan International School">Ryan International School</SelectItem>
                          <SelectItem value="DAV Public School">DAV Public School</SelectItem>
                          <SelectItem value="Kendriya Vidyalaya">Kendriya Vidyalaya</SelectItem>
                          <SelectItem value="Amity University">Amity University</SelectItem>
                          <SelectItem value="Jamia Millia Islamia">Jamia Millia Islamia</SelectItem>
                          <SelectItem value="Other">Other (Enter Manually)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {formData.institutionName === "Other" && (
                        <Input
                          placeholder="Enter Institution Name"
                          value={formData.customInstitutionName || ""}
                          onChange={(e) => handleInputChange("customInstitutionName", e.target.value)}
                          required
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Institution Type *</Label>
                      <Select value={formData.institutionType} onValueChange={(value) => handleInputChange("institutionType", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                          <SelectItem value="University">University</SelectItem>
                          <SelectItem value="Academy">Academy</SelectItem>
                          <SelectItem value="Training Center">Training Center</SelectItem>
                          <SelectItem value="Sports Club">Sports Club</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Registration Number</Label>
                      <Input
                        placeholder="e.g., UGC123456"
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Established Year</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 1995"
                        value={formData.establishedYear}
                        onChange={(e) => handleInputChange("establishedYear", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Phone className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Phone *</Label>
                      <Input
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Primary Email *</Label>
                      <Input
                        type="email"
                        placeholder="info@institution.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        placeholder="https://www.institution.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Alternate Phone</Label>
                      <Input
                        placeholder="+91 9876543211"
                        value={formData.alternatePhone}
                        onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Address Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Street Address *</Label>
                      <Textarea
                        placeholder="Complete street address"
                        value={formData.streetAddress}
                        onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>City *</Label>
                        <Input
                          placeholder="New Delhi"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>State *</Label>
                        <Input
                          placeholder="Delhi"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Postal Code *</Label>
                        <Input
                          placeholder="110001"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Country *</Label>
                        <Input
                          placeholder="India"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Landmark</Label>
                        <Input
                          placeholder="Near Metro Station"
                          value={formData.landmark}
                          onChange={(e) => handleInputChange("landmark", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Institution Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Institution Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea
                        placeholder="Brief description of your institution..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vision</Label>
                        <Textarea
                          placeholder="Institution's vision statement"
                          value={formData.vision}
                          onChange={(e) => handleInputChange("vision", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Mission</Label>
                        <Textarea
                          placeholder="Institution's mission statement"
                          value={formData.mission}
                          onChange={(e) => handleInputChange("mission", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Specializations</Label>
                        <Input
                          placeholder="e.g., Engineering, Medicine, Sports"
                          value={formData.specializations}
                          onChange={(e) => handleInputChange("specializations", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Languages Offered</Label>
                        <Input
                          placeholder="e.g., English, Hindi, French"
                          value={formData.languagesOffered}
                          onChange={(e) => handleInputChange("languagesOffered", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity & Staff Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Capacity & Staff</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Total Students</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={formData.totalStudents}
                        onChange={(e) => handleInputChange("totalStudents", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Staff</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={formData.totalStaff}
                        onChange={(e) => handleInputChange("totalStaff", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Sports Coaches</Label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={formData.sportsCoaches}
                        onChange={(e) => handleInputChange("sportsCoaches", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Teaching Staff</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        value={formData.teachingStaff}
                        onChange={(e) => handleInputChange("teachingStaff", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Non-Teaching Staff</Label>
                      <Input
                        type="number"
                        placeholder="20"
                        value={formData.nonTeachingStaff}
                        onChange={(e) => handleInputChange("nonTeachingStaff", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Contact Person Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Person Name *</Label>
                      <Input
                        placeholder="John Doe"
                        value={formData.contactPersonName}
                        onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Designation *</Label>
                      <Input
                        placeholder="Principal"
                        value={formData.contactPersonDesignation}
                        onChange={(e) => handleInputChange("contactPersonDesignation", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input
                        placeholder="+91 9876543210"
                        value={formData.contactPersonPhone}
                        onChange={(e) => handleInputChange("contactPersonPhone", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="contact@institution.com"
                          value={formData.contactPersonEmail}
                          onChange={(e) => handleInputChange("contactPersonEmail", e.target.value)}
                          className="flex-1"
                          required
                        />
                        <Button
                          type="button"
                          variant={emailVerified ? "default" : "outline"}
                          onClick={otpSent ? handleOtpVerification : handleSendOTP}
                          disabled={emailVerified || !formData.contactPersonEmail}
                          className="min-w-[120px]"
                        >
                          {emailVerified ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verified
                            </>
                          ) : otpSent ? (
                            "Verify OTP"
                          ) : (
                            "Send OTP"
                          )}
                        </Button>
                      </div>
                      
                      {otpSent && !emailVerified && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter OTP"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleOtpVerification}
                              disabled={!otpCode}
                            >
                              Verify
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            OTP sent to {formData.contactPersonEmail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  disabled={loading || !emailVerified}
                >
                  {loading ? "Registering Institution..." : emailVerified ? "Register Institution" : "Verify Email First"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link to="/institution/login" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstitutionRegisterPage;