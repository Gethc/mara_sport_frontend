import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Calendar, School, IdCard, Phone, MapPin, Building } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  validatePhoneWithDetails, 
  validateEmailWithDetails, 
  formatPhoneNumber,
  normalizePhoneNumber,
  PHONE_EXAMPLES 
} from "@/lib/validation";

interface PersonalDetailsStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack?: () => void;
}

// Default institutes (fallback if API fails)
const defaultInstitutes = [
  "University of Technology",
  "State College of Engineering", 
  "National Institute of Sports",
  "City University",
  "Technical Institute",
  "Other"
];

// Default institute types (fallback if API fails)
const defaultInstituteTypes = [
  "School",
  "College", 
  "University",
  "Academy",
  "Institute"
];

export const PersonalDetailsStep = ({ initialData, onComplete, onBack }: PersonalDetailsStepProps) => {
  const { toast } = useToast();
  
  // Debug logging
  console.log("PersonalDetailsStep received initialData:", initialData);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    middleName: initialData?.middleName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    gender: initialData?.gender || "",
    instituteName: initialData?.instituteName || "",
    otherInstitute: initialData?.otherInstitute || "",
    instituteType: initialData?.instituteType || "",
    studentId: initialData?.studentId || "",
    phoneNumber: initialData?.phoneNumber || "",
    address: initialData?.address || "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [instituteTypes, setInstituteTypes] = useState(defaultInstituteTypes);
  const [institutes, setInstitutes] = useState([]);
  const [loadingInstituteTypes, setLoadingInstituteTypes] = useState(true);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [loadedEmail, setLoadedEmail] = useState<string | null>(null);

  // Reset form when email changes
  useEffect(() => {
    if (initialData?.email && initialData.email !== loadedEmail) {
      setFormData({
        firstName: initialData.firstName || "",
        middleName: initialData.middleName || "",
        lastName: initialData.lastName || "",
        email: initialData.email,
        dateOfBirth: initialData.dateOfBirth || "",
        gender: initialData.gender || "",
        instituteName: initialData.instituteName || "",
        otherInstitute: initialData.otherInstitute || "",
        instituteType: initialData.instituteType || "",
        studentId: initialData.studentId || "",
        phoneNumber: initialData.phoneNumber || "",
        address: initialData.address || "",
      });
      setLoadedEmail(initialData.email); // Set loaded email to prevent reloading
    }
  }, [initialData?.email, loadedEmail]);

  // Load existing registration progress
  useEffect(() => {
    const loadExistingProgress = async () => {
      if (formData.email && formData.email !== loadedEmail) {
        try {
          const response = await apiService.getStudentRegistrationProgress(formData.email);
          if (response.data.success && response.data.data) {
            const progress = response.data.data;
            if (progress.personal_details) {
              setFormData(prev => ({
                ...prev,
                firstName: progress.personal_details.firstName || "",
                middleName: progress.personal_details.middleName || "",
                lastName: progress.personal_details.lastName || "",
                email: progress.personal_details.email || prev.email,
                dateOfBirth: progress.personal_details.dateOfBirth || "",
                gender: progress.personal_details.gender || "",
                instituteName: progress.personal_details.instituteName || "",
                otherInstitute: progress.personal_details.otherInstitute || "",
                instituteType: progress.personal_details.instituteType || "",
                studentId: progress.personal_details.studentId || "",
                phoneNumber: progress.personal_details.phoneNumber || "",
                address: progress.personal_details.address || "",
              }));
            }
          }
          setLoadedEmail(formData.email);
        } catch (error) {
          console.error("Failed to load existing progress:", error);
          setLoadedEmail(formData.email);
        }
      }
    };

    loadExistingProgress();
  }, [formData.email, loadedEmail]);

  // Load institute types from API
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
      } finally {
        setLoadingInstituteTypes(false);
      }
    };

    loadInstituteTypes();
  }, []);

  // Load institutes when institute type changes
  useEffect(() => {
    const loadInstitutes = async () => {
      if (!formData.instituteType) {
        setInstitutes([]);
        return;
      }

      setLoadingInstitutes(true);
      try {
        const response = await apiService.getInstitutesPublic(formData.instituteType);
        if (response.data.success) {
          const instituteNames = response.data.data.map((institute: any) => institute.name);
          setInstitutes([...instituteNames, "Other"]);
        }
      } catch (error) {
        console.error("Failed to load institutes:", error);
        setInstitutes(["Other"]); // Fallback to just "Other" option
      } finally {
        setLoadingInstitutes(false);
      }
    };

    loadInstitutes();
  }, [formData.instituteType]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
    
    // Reset institute name when institute type changes
    if (field === "instituteType") {
      setFormData(prev => ({ ...prev, instituteName: "", otherInstitute: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.firstName) newErrors.push("First Name is required");
    if (!formData.lastName) newErrors.push("Last Name is required");
    
    // Email validation
    const emailValidation = validateEmailWithDetails(formData.email);
    if (!emailValidation.isValid) {
      newErrors.push(emailValidation.errorMessage);
    }
    
    if (!formData.dateOfBirth) newErrors.push("Date of Birth is required");
    if (!formData.gender) newErrors.push("Gender is required");
    if (!formData.instituteType) newErrors.push("Institute Type is required");
    if (!formData.instituteName) newErrors.push("Institution is required");
    if (formData.instituteName === "Other" && !formData.otherInstitute) {
      newErrors.push("Please specify institution name");
    }
    if (!formData.studentId) newErrors.push("Student ID is required");
    
    // Phone number validation
    const phoneValidation = validatePhoneWithDetails(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.push(phoneValidation.errorMessage);
    }
    
    if (!formData.address) newErrors.push("Address is required");
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      // Save personal details to database
      const response = await apiService.savePersonalDetails(formData);
      
      if (response.data.success) {
        // Save registration progress
        const progressData = {
          email: formData.email,
          personal_details: formData,
          current_phase: 1,
          completed_phases: [1],
          is_completed: false
        };
        
        await apiService.saveStudentRegistrationProgress(progressData);
        
        toast({
          title: "Personal Details Saved! ✅",
          description: "Your personal information has been saved successfully.",
        });
        
        // Call onComplete with the response data
        onComplete({
          ...formData,
          student_id: response.data.data.student_id,
          registration_step: response.data.data.registration_step
        });
      } else {
        throw new Error(response.data.message || "Failed to save personal details");
      }
    } catch (error) {
      console.error("Error saving personal details:", error);
      toast({
        title: "Error Saving Details",
        description: error instanceof Error ? error.message : "Failed to save personal details. Please try again.",
        variant: "destructive",
      });
      setErrors(["Failed to save personal details. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Personal Details</CardTitle>
          <CardDescription>
            Please fill in your basic information accurately
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="middleName"
                  placeholder="Middle Name (Optional)"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Email (pre-filled)"
                value={formData.email}
                readOnly
                className="pl-10 bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Gender <span className="text-red-500">*</span></Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Institute Type <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Select 
                  value={formData.instituteType} 
                  onValueChange={(value) => handleInputChange("instituteType", value)}
                  disabled={loadingInstituteTypes}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder={loadingInstituteTypes ? "Loading types..." : "Select Institute Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {instituteTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Institution <span className="text-red-500">*</span></Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Select 
                  value={formData.instituteName} 
                  onValueChange={(value) => handleInputChange("instituteName", value)}
                  disabled={loadingInstitutes || !formData.instituteType}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue 
                      placeholder={
                        !formData.instituteType 
                          ? "Select Institute Type first" 
                          : loadingInstitutes 
                            ? "Loading institutes..." 
                            : "Select Institution"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {institutes.map((institute) => (
                      <SelectItem key={institute} value={institute}>
                        {institute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {formData.instituteName === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="otherInstitute">Institution Name <span className="text-red-500">*</span></Label>
              <Input
                id="otherInstitute"
                placeholder="Enter Institution Name"
                value={formData.otherInstitute}
                onChange={(e) => handleInputChange("otherInstitute", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID <span className="text-red-500">*</span></Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="studentId"
                placeholder="Student ID / Roll Number"
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="phoneNumber"
                placeholder="e.g., 0712345678, 0112345678, +254712345678"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const normalized = normalizePhoneNumber(e.target.value);
                  handleInputChange("phoneNumber", normalized);
                }}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a valid Kenyan phone number. Examples: {PHONE_EXAMPLES.join(', ')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
              <Textarea
                id="address"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="pl-10 min-h-[100px]"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              className="bg-gradient-primary ml-auto"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};