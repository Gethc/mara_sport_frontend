import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { UserTypeSelection } from "@/components/registration/UserTypeSelection";
import { EmailOtpStep } from "@/components/registration/EmailOtpStep";
import { RegistrationSidebar } from "@/components/registration/RegistrationSidebar";
import { PersonalDetailsStep } from "@/components/registration/PersonalDetailsStep";
import { DocumentUploadStep } from "@/components/registration/DocumentUploadStep";
import { ParentMedicalStep } from "@/components/registration/ParentMedicalStep";
import { SportsSelectionStep } from "@/components/registration/SportsSelectionStep";
import { ReviewPaymentStep } from "@/components/registration/ReviewPaymentStep";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

export const NewRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize state from localStorage or defaults
  const [currentStep, setCurrentStep] = useState<"userType" | "email" | 1 | 2 | 3 | 4 | 5>(() => {
    const savedStep = localStorage.getItem('student_registration_step');
    const savedEmail = localStorage.getItem('student_registration_email');
    const savedData = localStorage.getItem('student_registration_data');
    
    console.log('🔄 State restoration:', { savedStep, savedEmail, savedData });
    
    // If we have saved data with an email, we should be past the userType step
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.email) {
          // We have an email, so we're past userType
          if (savedStep === "userType") {
            return "email"; // Force to email step if step is userType but we have email
          } else if (savedStep === "email") {
            return "email";
          } else if (savedStep) {
            const stepNumber = parseInt(savedStep);
            if (stepNumber >= 1 && stepNumber <= 5) {
              return stepNumber as 1 | 2 | 3 | 4 | 5;
            }
          }
          // Default to step 1 if we have email but no valid step
          return 1;
        }
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
    
    // If we have a saved email but no data, go to email step
    if (savedEmail) {
      return "email";
    }
    
    return "userType";
  });
  
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem('student_registration_completed_steps');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [registrationData, setRegistrationData] = useState(() => {
    const saved = localStorage.getItem('student_registration_data');
    return saved ? JSON.parse(saved) : {
      userType: "",
      email: "",
      password: "",
      personalDetails: null,
      documents: null,
      parentMedical: null,
      sports: null,
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('student_registration_step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('student_registration_completed_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem('student_registration_data', JSON.stringify(registrationData));
  }, [registrationData]);

  // Auto-load existing data if we have a saved email but no personal details
  // Only auto-load if we're not in the middle of a fresh registration
  useEffect(() => {
    const savedEmail = localStorage.getItem('student_registration_email');
    const savedData = localStorage.getItem('student_registration_data');
    
    // Only auto-load if we have a saved email, it matches current email, 
    // no personal details yet, AND we have saved data (not a fresh start)
    if (savedEmail && 
        registrationData.email === savedEmail && 
        !registrationData.personalDetails && 
        savedData) {
      console.log('🔄 Auto-loading existing data for:', savedEmail);
      handleEmailComplete(savedEmail);
    }
  }, [registrationData.email, registrationData.personalDetails]);

  const handleUserTypeSelect = (type: "student" | "institution") => {
    if (type === "institution") {
      // Redirect to institution registration
      navigate("/institution/register");
      return;
    }
    
    setRegistrationData(prev => ({ ...prev, userType: type }));
    setCurrentStep("email");
  };

  const handleEmailComplete = async (email: string) => {
    setRegistrationData(prev => ({ ...prev, email }));
    
    // Clear any old registration data from localStorage for fresh start
    localStorage.removeItem('student_registration_data');
    localStorage.removeItem('student_registration_completed_steps');
    
    // Save email to localStorage immediately
    localStorage.setItem('student_registration_email', email);
    
    // Check for existing student data
    try {
      const response = await apiService.getStudentPrefillData(email);
      if (response.data && (response.data as any).success && (response.data as any).data) {
        const existingData = (response.data as any).data;
        
        // Pre-fill the registration data with existing information
        setRegistrationData(prev => ({
          ...prev,
          personalDetails: {
            firstName: existingData.fname || "",
            middleName: existingData.mname || "",
            lastName: existingData.lname || "",
            email: existingData.email || email,
            phoneNumber: existingData.phone || "",
            address: existingData.address || "",
            dateOfBirth: existingData.dob || "",
            gender: existingData.gender || "",
            studentId: existingData.student_id || "",
            instituteName: existingData.institute_name || "",
            instituteType: existingData.institute_type || "",
          },
          sports: {
            selectedSports: existingData.sports || [],
            experience: "",
            achievements: "",
            preferences: ""
          }
        }));
        
        toast({
          title: "Existing Data Found!",
          description: `Welcome back! We found your existing data from ${existingData.institute_name}. Please review and complete any missing information.`,
        });
      } else {
        toast({
          title: "Email Verified Successfully",
          description: "Please complete your personal details.",
        });
      }
    } catch (error) {
      console.error('Error checking for existing data:', error);
      toast({
        title: "Email Verified Successfully",
        description: "Please complete your personal details.",
      });
    }
    
    setCurrentStep(1);
  };

  const handleStepComplete = (step: number, data: any) => {
    const stepKey = step === 1 ? "personalDetails" :
                   step === 2 ? "documents" :
                   step === 3 ? "parentMedical" :
                   step === 4 ? "sports" : null;

    if (stepKey) {
      setRegistrationData(prev => ({ 
        ...prev, 
        [stepKey]: data,
        // Pre-fill email in personal details
        ...(step === 1 && { personalDetails: { ...data, email: prev.email } })
      }));
    }

    // Mark step as completed
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }

    // Move to next step
    if (step < 5) {
      setCurrentStep((step + 1) as any);
    }
  };

  const handleBack = (step: number) => {
    if (step === 1) {
      // Show confirmation dialog when going back from first step
      const confirmed = window.confirm(
        "Are you sure you want to go back? You will lose your current progress and be redirected to the login page."
      );
      
      if (confirmed) {
        // Clear localStorage and redirect to login
        localStorage.removeItem('student_registration_step');
        localStorage.removeItem('student_registration_email');
        localStorage.removeItem('student_registration_data');
        localStorage.removeItem('student_registration_completed_steps');
        navigate("/login");
      }
    } else {
      setCurrentStep((step - 1) as any);
    }
  };

  const handleEmailBack = () => {
    setCurrentStep("userType");
  };

  const handleFinalComplete = () => {
    // Save registration data to localStorage for demo
    localStorage.setItem('registrationData', JSON.stringify(registrationData));
    
    // Clear registration progress from localStorage
    localStorage.removeItem('student_registration_step');
    localStorage.removeItem('student_registration_email');
    localStorage.removeItem('student_registration_data');
    localStorage.removeItem('student_registration_completed_steps');
    
    toast({
      title: "Registration Complete! 🎉",
      description: "Welcome! Your account has been created successfully.",
    });
    
    // Navigate to login page
    navigate("/login");
  };

  if (currentStep === "userType") {
    return <UserTypeSelection onTypeSelect={handleUserTypeSelect} />;
  }

  if (currentStep === "email") {
    return <EmailOtpStep onComplete={handleEmailComplete} onBack={handleEmailBack} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile steps trigger */}
      <div className="md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="flex items-center justify-between p-3">
          <div className="text-sm font-medium">Registration</div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PanelLeft className="h-4 w-4" /> Steps
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 max-w-[85vw]">
              <RegistrationSidebar showOnMobile currentStep={currentStep as number} completedSteps={completedSteps} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop sidebar */}
      <RegistrationSidebar 
        currentStep={currentStep as number} 
        completedSteps={completedSteps} 
      />
      
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <PersonalDetailsStep
              initialData={{ 
                email: registrationData.email, 
                ...(registrationData.personalDetails || {})
              }}
              onComplete={(data) => handleStepComplete(1, data)}
              onBack={() => handleBack(1)}
            />
          )}
          
          {currentStep === 2 && (
            <DocumentUploadStep
              initialData={registrationData.documents}
              email={registrationData.email}
              onComplete={(data) => handleStepComplete(2, data)}
              onBack={() => handleBack(2)}
            />
          )}
          
          {currentStep === 3 && (
            <ParentMedicalStep
              initialData={registrationData.parentMedical}
              email={registrationData.email}
              onComplete={(data) => handleStepComplete(3, data)}
              onBack={() => handleBack(3)}
            />
          )}
          
          {currentStep === 4 && (
            <SportsSelectionStep
              initialData={registrationData.sports}
              email={registrationData.email}
              onComplete={(data) => handleStepComplete(4, data)}
              onBack={() => handleBack(4)}
            />
          )}
          
          {currentStep === 5 && (
            <ReviewPaymentStep
              registrationData={registrationData}
              email={registrationData.email}
              onComplete={handleFinalComplete}
              onBack={() => handleBack(5)}
            />
          )}
        </div>
      </div>
    </div>
  );
};