import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { UserTypeSelection } from "@/components/registration/UserTypeSelection";
import { EmailOtpStep } from "@/components/registration/EmailOtpStep";
import { InstitutionDetailsStep } from "@/components/institution-registration/InstitutionDetailsStep";
import { SportsSubCategoriesStep } from "@/components/institution-registration/SportsSubCategoriesStep";
import { SportStudentAddStep } from "@/components/institution-registration/SportStudentAddStep";
import { InstitutionPaymentStep } from "@/components/institution-registration/InstitutionPaymentStep";
import { InstitutionRegistrationSidebar } from "@/components/registration/InstitutionRegistrationSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

export const NewInstitutionRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize state from localStorage or defaults
  const [currentStep, setCurrentStep] = useState<"userType" | "email" | 1 | 2 | 3 | 4>(() => {
    const savedStep = localStorage.getItem('institution_registration_step');
    const savedEmail = localStorage.getItem('institution_registration_email');
    
    // If we have a saved email, we should be past the userType step
    if (savedEmail && savedStep) {
      // Convert string back to proper type
      if (savedStep === "userType" || savedStep === "email") {
        return savedStep;
      } else {
        const stepNumber = parseInt(savedStep);
        if (stepNumber === 1 || stepNumber === 2 || stepNumber === 3 || stepNumber === 4) {
          return stepNumber as 1 | 2 | 3 | 4;
        }
      }
    } else if (savedEmail) {
      // If we have email but no step, we're likely in email verification or step 1
      return "email";
    }
    
    return "userType";
  });
  
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem('institution_registration_completed_steps');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [registrationData, setRegistrationData] = useState(() => {
    const saved = localStorage.getItem('institution_registration_data');
    return saved ? JSON.parse(saved) : {
      userType: "institution",
      email: "",
      password: "",
      institutionDetails: null,
      // selectedSports removed
      students: null,
      payment: null,
    };
  });

  const [isLoadingCheckpoint, setIsLoadingCheckpoint] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(() => {
    const saved = localStorage.getItem('institution_registration_verification_status');
    return saved ? JSON.parse(saved) : {
      institutionEmailVerified: false,
      contactPersonEmailVerified: false,
    };
  });

  // Load checkpoint from server when email is available
  useEffect(() => {
    const loadCheckpointFromServer = async () => {
      if (registrationData.email && !isLoadingCheckpoint) {
        console.log("🔄 Loading checkpoint from server for:", registrationData.email);
        setIsLoadingCheckpoint(true);
        
        try {
          const response = await apiService.loadRegistrationCheckpoint(registrationData.email);
          if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            const responseData = response.data as any;
            if (responseData.success) {
              const checkpointData = responseData.data;
              console.log("📥 Checkpoint loaded:", checkpointData);
              
              if (checkpointData.step > 0) {
                // Update state with checkpoint data
                setCurrentStep(checkpointData.step as 1 | 2 | 3 | 4);
                setCompletedSteps(checkpointData.completed_steps || []);
                setRegistrationData(prev => ({
                  ...prev,
                  ...checkpointData.data
                }));
                
                toast({
                  title: "Progress Restored! 📋",
                  description: `Welcome back! We've restored your progress from step ${checkpointData.step}.`,
                });
              }
            }
          }
        } catch (error) {
          console.error("❌ Failed to load checkpoint:", error);
          // Don't show error to user, just continue with localStorage data
        } finally {
          setIsLoadingCheckpoint(false);
        }
      }
    };

    loadCheckpointFromServer();
  }, [registrationData.email, toast]);

  // Auto-save checkpoint to server when step is completed
  const saveCheckpointToServer = async (step: number, data: any) => {
    if (registrationData.email && step > 0) {
      try {
        console.log("💾 Saving checkpoint to server for step:", step);
        
        // Save the complete registration data, not just the current step
        const completeData = {
          ...registrationData,
          [step === 1 ? "institutionDetails" : step === 3 ? "students" : step === 4 ? "payment" : "data"]: data
        };
        
        await apiService.saveRegistrationCheckpoint(registrationData.email, step, completeData);
        console.log("✅ Checkpoint saved successfully");
      } catch (error) {
        console.error("❌ Failed to save checkpoint:", error);
        // Don't show error to user, localStorage backup is still working
      }
    }
  };

  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Persist currentStep to localStorage
  useEffect(() => {
    localStorage.setItem('institution_registration_step', currentStep.toString());
  }, [currentStep]);

  // Persist completedSteps to localStorage (filter out step 2 if present)
  useEffect(() => {
    const filtered = completedSteps.filter(s => s !== 2);
    localStorage.setItem('institution_registration_completed_steps', JSON.stringify(filtered));
  }, [completedSteps]);

  // Persist registrationData to localStorage
  useEffect(() => {
    localStorage.setItem('institution_registration_data', JSON.stringify(registrationData));
  }, [registrationData]);

  // Persist email separately for easy access
  useEffect(() => {
    if (registrationData.email) {
      localStorage.setItem('institution_registration_email', registrationData.email);
    }
  }, [registrationData.email]);

  // Persist verificationStatus to localStorage
  useEffect(() => {
    localStorage.setItem('institution_registration_verification_status', JSON.stringify(verificationStatus));
  }, [verificationStatus]);


  // Load registration progress when email is first set
  useEffect(() => {
    const loadProgress = async () => {
      console.log("loadProgress triggered with email:", registrationData.email);
      if (registrationData.email && !isLoadingProgress) {
        setIsLoadingProgress(true);
        try {
          const response = await apiService.getInstitutionRegistrationProgress(registrationData.email);
          if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
            const responseData = response.data as any;
            if (responseData.success && responseData.data) {
              const progressData = responseData.data;
              console.log("Loading progress data:", progressData);
            setRegistrationData(prev => ({
              ...prev,
              institutionDetails: progressData.institution_details || null,
              selectedSports: progressData.sports_subcategories || null,
              students: progressData.students || null,
              payment: progressData.payment_info || null
            }));
            
            // Set completed steps based on saved data
            // Frontend has 3 steps: 1=Institution, 2=Students, 3=Payment
            const completedSteps = [];
            if (progressData.institution_details) completedSteps.push(1); // Institution Details
            if (progressData.students && progressData.students.sportTeams && progressData.students.sportTeams.length > 0) completedSteps.push(2); // Add Students
            if (progressData.payment_info) completedSteps.push(3); // Payment
            setCompletedSteps(completedSteps);
            
            // Set current step based on checkpoint data
            if (progressData.step) {
              // Map backend step to frontend step
              // Backend: 1=Institution, 2=Contact, 3=Students, 4=Payment
              // Frontend: 1=Institution, 2=Students, 3=Payment
              let frontendStep: 1 | 2 | 3 | 4;
              if (progressData.step === 1) {
                frontendStep = 1; // Institution Details
              } else if (progressData.step === 2) {
                frontendStep = 2; // Contact Person (skip in frontend, go to Students)
              } else if (progressData.step === 3) {
                frontendStep = 2; // Add Students
              } else if (progressData.step === 4) {
                frontendStep = 3; // Payment
              } else {
                frontendStep = 1; // Default
              }
              setCurrentStep(frontendStep);
            } else {
              // Determine current step based on completed steps
              if (completedSteps.length === 0) {
                setCurrentStep(1); // Institution Details
              } else if (completedSteps.length === 1) {
                setCurrentStep(2); // Add Students
              } else if (completedSteps.length === 2) {
                setCurrentStep(3); // Payment
              } else {
                setCurrentStep(3); // All done, stay on Payment
              }
            }
            
            console.log("Completed steps set to:", completedSteps);
            console.log("Current step set to:", progressData.step || "calculated");
            }
          }
        } catch (error) {
          console.error('Error loading registration progress:', error);
        } finally {
          setIsLoadingProgress(false);
        }
      }
    };

    loadProgress();
  }, [registrationData.email]); // Keep the dependency but add isLoadingProgress check

  // Save registration progress (sports step removed)
  const saveProgress = async (stepData: any, step: number) => {
    if (!registrationData.email) return;

    try {
      const progressData = {
        email: registrationData.email,
        current_phase: step,
        completed_phases: completedSteps,
        institution_details: step === 1 ? stepData : registrationData.institutionDetails,
        sports_subcategories: null,
        students: step === 3 ? stepData : registrationData.students,
        payment_info: step === 4 ? stepData : registrationData.payment
      };

      await apiService.saveInstitutionRegistrationProgress(progressData);
    } catch (error) {
      console.error('Error saving registration progress:', error);
    }
  };

  const handleUserTypeSelect = (type: "student" | "institution") => {
    if (type === "student") {
      // Redirect to student registration
      navigate("/register");
      return;
    }
    
    setRegistrationData(prev => ({ ...prev, userType: type }));
    setCurrentStep("email");
  };

  // Function to clear registration data and start fresh
  const clearRegistrationData = () => {
    localStorage.removeItem('institution_registration_step');
    localStorage.removeItem('institution_registration_completed_steps');
    localStorage.removeItem('institution_registration_data');
    localStorage.removeItem('institution_registration_email');
    localStorage.removeItem('institution_registration_verification_status');
    
    setCurrentStep("userType");
    setCompletedSteps([]);
    setRegistrationData({
      userType: "institution",
      email: "",
      password: "",
      institutionDetails: null,
      selectedSports: null,
      students: null,
      payment: null,
    });
    setVerificationStatus({
      institutionEmailVerified: false,
      contactPersonEmailVerified: false,
    });
  };

  const handleEmailComplete = (email: string) => {
    console.log("handleEmailComplete called with email:", email);
    console.log("Current step before update:", currentStep);
    setRegistrationData(prev => ({ ...prev, email }));
    setCurrentStep(1);
    console.log("Current step set to:", 1);
    toast({
      title: "Email Verified Successfully",
      description: "Please complete your institution details.",
    });
  };

  const handleStepComplete = async (step: number, data: any) => {
    const stepKey = step === 1 ? "institutionDetails" :
                   step === 3 ? "students" :
                   step === 4 ? "payment" : null;

    if (stepKey) {
      setRegistrationData(prev => ({ 
        ...prev, 
        [stepKey]: data,
        // Pre-fill email in institution details if it's the first step
        ...(step === 1 && { 
          institutionDetails: { 
            ...data, 
            institutionEmail: data.institutionEmail || prev.email 
          } 
        })
      }));
    }

    // Mark step as completed
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }

    // Save progress to database
    await saveProgress(data, step);
    
    // Save checkpoint to server
    await saveCheckpointToServer(step, data);

    // Move to next step (skip step 2). On step 4, also finalize create in DB
    if (step === 1) {
      setCurrentStep(3);
    } else if (step === 3) {
      setCurrentStep(4);
    } else if (step === 4) {
      // Attempt to persist institution to DB if not already saved
      try {
        const details = (registrationData as any).institutionDetails || {};
        const instituteData = {
          name: details.institutionName || details.customInstitutionName || "Institution",
          email: (registrationData as any).email,
          type_id: 1,
          // Contact person (optional)
          contactPersonName: details.contactPersonName,
          contactPersonEmail: details.contactPersonEmail,
          contactPersonPhone: details.contactPersonPhone,
          contactPersonDesignation: details.contactPersonDesignation,
          // Institute information
          phone: details.phoneNumber || details.phone,
          website: details.website,
          principalName: details.principalName,
          principalPhone: details.principalContact || details.principalPhone,
        };

        const resp = await apiService.createInstitute(instituteData);
        const ok = resp?.data?.success === true;
        if (ok) {
          toast({
            title: "Institution saved",
            description: "Registration details have been stored successfully.",
          });
        } else {
          toast({
            title: "Save failed",
            description: resp?.data?.message || "Could not store institution in database.",
            variant: "destructive",
          });
        }
      } catch (e) {
        console.error("Finalize institution failed", e);
        toast({
          title: "Save failed",
          description: "Unexpected error while saving institution.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = (step: number) => {
    if (step === 1) {
      setCurrentStep("email");
    } else if (step === 3) {
      setCurrentStep(1);
    } else if (step === 4) {
      setCurrentStep(3);
    }
  };

  const handleEmailBack = () => {
    setCurrentStep("userType");
  };

  const handleFinalComplete = async (paymentData: any) => {
    try {
      const finalData = {
        ...registrationData,
        payment: paymentData,
      };

      // Create institute via API
      const instituteData = {
        name: finalData.institutionDetails?.institutionName || finalData.institutionDetails?.customInstitutionName,
        email: finalData.email,
        type: finalData.institutionDetails?.institutionType,
        // Contact person information
        contactPersonName: finalData.institutionDetails?.contactPersonName,
        contactPersonEmail: finalData.institutionDetails?.contactPersonEmail,
        contactPersonPhone: finalData.institutionDetails?.contactPersonPhone,
        contactPersonDesignation: finalData.institutionDetails?.contactPersonDesignation,
        // Institute information
        phone: finalData.institutionDetails?.phone,
        website: finalData.institutionDetails?.website,
        principalName: finalData.institutionDetails?.principalName,
        principalPhone: finalData.institutionDetails?.principalPhone,
        // Address information
        streetAddress: finalData.institutionDetails?.streetAddress,
        city: finalData.institutionDetails?.city,
        state: finalData.institutionDetails?.state,
        country: finalData.institutionDetails?.country,
        postalCode: finalData.institutionDetails?.postalCode,
        // Additional information
        description: finalData.institutionDetails?.description,
        vision: finalData.institutionDetails?.vision,
        mission: finalData.institutionDetails?.mission,
        // Sports and students data
        selectedSports: finalData.selectedSports,
        students: finalData.students,
        payment: finalData.payment
      };

      const response = await apiService.createInstitute(instituteData);
      
      if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success) {
        const responseData = response.data as any;
        const instituteId = responseData.data?.id;
        
        toast({
          title: "Institution Registration Complete! 🎉",
          description: `Your Institution ID is: ${instituteId}`,
        });
      } else if (response.data && typeof response.data === 'object' && 'error_code' in response.data && response.data.error_code === 'EMAIL_EXISTS') {
        // Institution already exists, which is fine - registration is complete
        toast({
          title: "Institution Registration Complete! 🎉",
          description: "Your institution is already registered and up to date.",
        });
      } else {
        const responseData = response.data as any;
        throw new Error(responseData?.message || "Registration failed");
      }
      
      // Clear registration data from localStorage (for both success and existing cases)
      localStorage.removeItem('institution_registration_step');
      localStorage.removeItem('institution_registration_completed_steps');
      localStorage.removeItem('institution_registration_data');
      localStorage.removeItem('institution_registration_email');
      localStorage.removeItem('institution_registration_verification_status');
      
      // Clear checkpoint from server
      try {
        await apiService.clearRegistrationCheckpoint(finalData.email);
        console.log("✅ Checkpoint cleared from server");
      } catch (error) {
        console.error("❌ Failed to clear checkpoint:", error);
        // Don't block the flow if checkpoint clearing fails
      }
      
      // Navigate to institution dashboard
      navigate("/institution");
  } catch (error) {
    console.error('Registration error:', error);
    toast({
      title: "Registration Failed",
      description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
      variant: "destructive",
    });
  }
};

  // Debug localStorage state
  console.log("Current localStorage state:");
  console.log("- institution_registration_step:", localStorage.getItem('institution_registration_step'));
  console.log("- institution_registration_email:", localStorage.getItem('institution_registration_email'));
  console.log("- institution_registration_data:", localStorage.getItem('institution_registration_data'));
  console.log("Current step:", currentStep, "Type:", typeof currentStep);
  console.log("Registration data:", registrationData);

  if (currentStep === "userType") {
    console.log("Rendering UserTypeSelection");
    return <UserTypeSelection onTypeSelect={handleUserTypeSelect} />;
  }

  if (currentStep === "email") {
    console.log("Rendering EmailOtpStep");
    return <EmailOtpStep onComplete={handleEmailComplete} onBack={handleEmailBack} userType="institution" purpose="registration" />;
  }

  console.log("Rendering main registration flow with currentStep:", currentStep);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile steps trigger */}
      <div className="md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="flex items-center justify-between p-3">
          <div className="text-sm font-medium">Institution Registration</div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PanelLeft className="h-4 w-4" /> Steps
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 max-w-[85vw]">
              <InstitutionRegistrationSidebar showOnMobile currentStep={currentStep as number} completedSteps={completedSteps} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <InstitutionRegistrationSidebar 
        currentStep={currentStep as number} 
        completedSteps={completedSteps} 
      />
      
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <>
              {console.log("✅ Rendering InstitutionDetailsStep - currentStep === 1 is true")}
              {console.log("Passing to InstitutionDetailsStep:", {
                initialData: { 
                  institutionEmail: registrationData.email,
                  ...(registrationData.institutionDetails || {})
                },
                verificationStatus
              })}
              <InstitutionDetailsStep
                initialData={{ 
                  institutionEmail: registrationData.email,
                  ...(registrationData.institutionDetails || {})
                }}
                verificationStatus={verificationStatus}
                onComplete={(data) => handleStepComplete(1, data)}
                onVerificationChange={setVerificationStatus}
                onBack={() => handleBack(1)}
              />
            </>
          )}
          
          {currentStep !== 1 && (
            <>
              {console.log("❌ Not rendering InstitutionDetailsStep - currentStep !== 1")}
              {console.log("currentStep value:", currentStep, "Type:", typeof currentStep)}
            </>
          )}
          
          {currentStep === 2 && (
            <SportStudentAddStep
              initialData={registrationData.students}
              onComplete={(data) => handleStepComplete(2, data)}
              onBack={() => handleBack(2)}
            />
          )}
          
          {currentStep === 3 && (
            <InstitutionPaymentStep
              institutionData={{
                ...registrationData.institutionDetails,
                selectedSports: registrationData.selectedSports?.selectedSports || [],
                students: registrationData.students?.students || [],
                sportTeams: registrationData.students?.sportTeams || [],
              }}
              onComplete={handleFinalComplete}
              onBack={() => handleBack(3)}
              loading={false}
            />
          )}
          
        </div>
      </div>
    </div>
  );
};