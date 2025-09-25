import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  const [currentStep, setCurrentStep] = useState<"userType" | "email" | 1 | 2 | 3 | 4 | 5>("userType");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [registrationData, setRegistrationData] = useState({
    userType: "",
    email: "",
    password: "",
    personalDetails: null,
    documents: null,
    parentMedical: null,
    sports: null,
  });

  const handleUserTypeSelect = (type: "student" | "institution") => {
    if (type === "institution") {
      // Redirect to institution registration
      navigate("/institution/register");
      return;
    }
    
    setRegistrationData(prev => ({ ...prev, userType: type }));
    setCurrentStep("email");
  };

  const handleEmailComplete = (email: string) => {
    setRegistrationData(prev => ({ ...prev, email }));
    setCurrentStep(1);
    toast({
      title: "Email Verified Successfully",
      description: "Please complete your personal details.",
    });
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
      setCurrentStep("email");
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