import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { UserTypeSelection } from "@/components/registration/UserTypeSelection";
import { EmailOtpStep } from "@/components/registration/EmailOtpStep";
import { InstitutionDetailsStep } from "@/components/institution-registration/InstitutionDetailsStep";
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
  const [currentStep, setCurrentStep] = useState<"userType" | "email" | 1 | 2 | 3>(() => {
    const savedStep = localStorage.getItem('institution_registration_step');
    const savedEmail = localStorage.getItem('institution_registration_email');
    
    // If we have a saved email, we should be past the userType step
    if (savedEmail && savedStep) {
      // Convert string back to proper type
      if (savedStep === "userType" || savedStep === "email") {
        return savedStep;
      } else {
        const stepNumber = parseInt(savedStep);
        if (stepNumber >= 1 && stepNumber <= 3) {
          return stepNumber as 1 | 2 | 3;
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
                // Map old step numbers to new step numbers
                let mappedStep = checkpointData.step;
                if (checkpointData.step === 4) {
                  mappedStep = 3; // Old step 4 (Payment) becomes new step 3
                } else if (checkpointData.step === 3) {
                  mappedStep = 2; // Old step 3 (Add Students) becomes new step 2
                }
                // Step 2 (Sports & Categories) is removed, so we skip it
                
                // Update state with checkpoint data
                setCurrentStep(mappedStep as 1 | 2 | 3);
                setCompletedSteps(checkpointData.completed_steps || []);
                setRegistrationData(prev => ({
                  ...prev,
                  ...checkpointData.data
                }));
                
                toast({
                  title: "Progress Restored! 📋",
                  description: `Welcome back! We've restored your progress from step ${mappedStep}.`,
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
  }, [registrationData.email, toast]); // Removed isLoadingCheckpoint from dependencies

  // Auto-save checkpoint to server when step is completed
  const saveCheckpointToServer = async (step: number, data: any) => {
    if (registrationData.email && step > 0) {
      try {
        console.log("💾 Saving checkpoint to server for step:", step);
        await apiService.saveRegistrationCheckpoint(registrationData.email, step, data);
        console.log("✅ Checkpoint saved successfully");
        
        // Show success message to user
        toast({
          title: "Progress Saved ✅",
          description: `Your progress for step ${step} has been saved successfully.`,
        });
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

  // Persist completedSteps to localStorage
  useEffect(() => {
    localStorage.setItem('institution_registration_completed_steps', JSON.stringify(completedSteps));
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
          // Load registration progress from proper API
          const progressResponse = await apiService.getInstitutionRegistrationProgress(registrationData.email);
          console.log("Progress response:", progressResponse);
          
          if (progressResponse.data && typeof progressResponse.data === 'object' && 'success' in progressResponse.data && progressResponse.data.success) {
            const progressData = progressResponse.data.data;
            console.log("Loading progress data:", progressData);
            
            if (progressData) {
              // Update current step based on progress
              if (progressData.current_phase > 0) {
                setCurrentStep(progressData.current_phase as any);
              }
              
              // Update completed steps
              if (progressData.completed_phases && Array.isArray(progressData.completed_phases)) {
                setCompletedSteps(progressData.completed_phases);
              }
              
              // Update registration data with progress data
              setRegistrationData(prev => ({
                ...prev,
                institutionDetails: progressData.institution_details || null,
                students: progressData.students || null,
                payment: progressData.payment_info || null
              }));
              
              console.log("✅ Registration progress loaded successfully");
            } else {
              console.log("⚠️ No progress data found, using localStorage data");
              // Don't reset to step 1 if we have localStorage data
              const savedStep = localStorage.getItem('institution_registration_step');
              const savedEmail = localStorage.getItem('institution_registration_email');
              
              if (savedEmail === registrationData.email && savedStep) {
                console.log("Using saved step from localStorage:", savedStep);
                // Keep the current step from localStorage
              } else {
                console.log("No saved data found, starting from step 1");
              }
            }
          } else {
            console.log("⚠️ No progress found, using localStorage data");
            // Don't reset to step 1 if we have localStorage data
            const savedStep = localStorage.getItem('institution_registration_step');
            const savedEmail = localStorage.getItem('institution_registration_email');
            
            if (savedEmail === registrationData.email && savedStep) {
              console.log("Using saved step from localStorage:", savedStep);
              // Keep the current step from localStorage
            } else {
              console.log("No saved data found, starting from step 1");
            }
          }
        } catch (error) {
          console.error("❌ Error loading registration progress:", error);
          // Don't reset to step 1 on error, keep localStorage data
          const savedStep = localStorage.getItem('institution_registration_step');
          const savedEmail = localStorage.getItem('institution_registration_email');
          
          if (savedEmail === registrationData.email && savedStep) {
            console.log("Using saved step from localStorage after error:", savedStep);
          }
        } finally {
          setIsLoadingProgress(false);
        }
      }
    };

    loadProgress();
  }, [registrationData.email]);

  // Save registration progress
  const saveProgress = async (stepData: any, step: number) => {
    if (!registrationData.email) return;

    try {
      // Prepare progress data for the proper API
      const progressData = {
        email: registrationData.email,
        current_phase: step,
        completed_phases: completedSteps,
        institution_details: step === 1 ? stepData : registrationData.institutionDetails,
        students: step === 2 ? stepData : registrationData.students,
        payment_info: step === 3 ? stepData : registrationData.payment
      };

      // Save to proper registration progress system
      await apiService.saveInstitutionRegistrationProgress(progressData);
      console.log("✅ Registration progress saved successfully for step:", step);
    } catch (error) {
      console.error('❌ Error saving registration progress:', error);
      // Don't show error to user, just log it
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
      students: null,
      payment: null,
    });
    setVerificationStatus({
      institutionEmailVerified: false,
      contactPersonEmailVerified: false,
    });
  };

  const handleEmailComplete = (email: string) => {
    setRegistrationData(prev => ({ ...prev, email }));
    setCurrentStep(1);
    toast({
      title: "Email Verified Successfully",
      description: "Please complete your institution details.",
    });
  };

  const handleStepComplete = async (step: number, data: any) => {
    const stepKey = step === 1 ? "institutionDetails" :
                   step === 2 ? "students" :
                   step === 3 ? "payment" : null;

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
    
    // Save checkpoint to server with complete registration data
    const completeData = {
      ...registrationData,
      [stepKey]: data
    };
    await saveCheckpointToServer(step, completeData);

    // Move to next step
    if (step < 3) {
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
        // Students data (sports are now included in students data)
        students: finalData.students,
        payment: finalData.payment
      };

      const response = await apiService.createInstitute(instituteData);
      
      let instituteId = null;
      let isExisting = false;
      
      if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success) {
        const responseData = response.data as any;
        instituteId = responseData.data?.id;
      } else {
        // Check if it's a duplicate email error
        const responseData = response.data as any;
        if (responseData?.error_code === "EMAIL_EXISTS") {
          // Institute already exists, get the existing institute ID
          try {
            const existingInstituteResponse = await apiService.getInstituteByEmail(finalData.email);
            if (existingInstituteResponse.data?.success) {
              instituteId = existingInstituteResponse.data.data?.id;
              isExisting = true;
              console.log("Using existing institute ID:", instituteId);
            }
          } catch (error) {
            console.error("Failed to get existing institute:", error);
          }
        }
        
        if (!instituteId) {
          throw new Error(responseData?.message || "Registration failed");
        }
      }
      
      if (instituteId) {
        toast({
          title: isExisting ? "Registration Completed! 🎉" : "Institution Registration Complete! 🎉",
          description: `Your Institution ID is: ${instituteId}`,
        });
        
        // Clear registration data from localStorage
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
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    }
  };


  if (currentStep === "userType") {
    return <UserTypeSelection onTypeSelect={handleUserTypeSelect} />;
  }

  if (currentStep === "email") {
    return <EmailOtpStep onComplete={handleEmailComplete} onBack={handleEmailBack} userType="institution" purpose="registration" />;
  }

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