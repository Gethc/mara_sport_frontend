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
  const [currentStep, setCurrentStep] = useState<"userType" | "email" | 1 | 3 | 4>(() => {
    const savedStep = localStorage.getItem('institution_registration_step');
    const savedEmail = localStorage.getItem('institution_registration_email');
    
    // If we have a saved email, we should be past the userType step
    if (savedEmail && savedStep) {
      // Convert string back to proper type
      if (savedStep === "userType" || savedStep === "email") {
        return savedStep;
      } else {
        const stepNumber = parseInt(savedStep);
        if (stepNumber === 1 || stepNumber === 3 || stepNumber === 4) {
          return stepNumber as 1 | 3 | 4;
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
                // Map old step numbers to new step numbers
                let mappedStep = checkpointData.step;
                if (checkpointData.step === 4) {
                  mappedStep = 3; // Old step 4 (Payment) becomes new step 3
                } else if (checkpointData.step === 3) {
                  mappedStep = 3; // Old step 3 (Add Students) becomes new step 3
                }
                // Step 2 (Sports & Categories) is removed, so we skip it
                
                // Update state with checkpoint data
                setCurrentStep(mappedStep as 1 | 3 | 4);
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
          // Load registration progress from proper API
          const progressResponse = await apiService.getInstitutionRegistrationProgress(registrationData.email);
          console.log("Progress response:", progressResponse);
          
          if (progressResponse.data && typeof progressResponse.data === 'object' && 'success' in progressResponse.data && progressResponse.data.success) {
            const progressData = (progressResponse.data as any).data;
            console.log("Loading progress data:", progressData);
            
            if (progressData) {
                // Update current step based on progress
                if (progressData.current_phase > 0) {
                  const phase = progressData.current_phase;
                  if (phase === 1) {
                    setCurrentStep(1); // Institution Details
                  } else if (phase === 2) {
                    // Backend step 2 (Contact Person) maps to frontend step 3 (Add Students)
                    setCurrentStep(3);
                  } else if (phase === 3) {
                    setCurrentStep(3); // Add Students
                  } else if (phase === 4) {
                    setCurrentStep(4); // Payment
                  }
                }
              
              // Update completed steps - map backend phases to frontend steps
              if (progressData.completed_phases && Array.isArray(progressData.completed_phases)) {
                const mappedSteps = progressData.completed_phases.map(phase => {
                  if (phase === 1) return 1; // Institution Details
                  if (phase === 2) return 1; // Backend step 2 (Contact Person) maps to frontend step 1 completion
                  if (phase === 3) return 3; // Add Students
                  if (phase === 4) return 4; // Payment
                  return phase;
                }).filter((step, index, self) => self.indexOf(step) === index); // Remove duplicates
                
                setCompletedSteps(mappedSteps);
              }
              
              // Update registration data with progress data
              // Handle nested data structure from backend
              let institutionDetails = null;
              if (progressData.institution_details) {
                if (progressData.institution_details.institutionDetails) {
                  // Data is nested: institution_details.institutionDetails
                  institutionDetails = progressData.institution_details.institutionDetails;
                } else {
                  // Data is directly in institution_details
                  institutionDetails = progressData.institution_details;
                }
              }
              
              setRegistrationData(prev => ({
                ...prev,
                institutionDetails: institutionDetails,
                students: progressData.students || null,
                payment: progressData.payment_info || null,
                instituteId: progressData.institute_id || null
              }));
              
              console.log("🔍 Debug - Loaded students data:", progressData.students);
              console.log("🔍 Debug - Loaded sportTeams:", progressData.students?.sportTeams);
              
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

  // Save registration progress (sports step removed)
  const saveProgress = async (stepData: any, step: number) => {
    if (!registrationData.email) return;

    try {
      // Prepare progress data for the proper API
      const progressData = {
        email: registrationData.email,
        current_phase: step,
        completed_phases: completedSteps,
        institution_details: step === 1 ? stepData : registrationData.institutionDetails,
        sports_subcategories: null,
        students: step === 3 ? stepData : registrationData.students,
        payment_info: step === 4 ? stepData : registrationData.payment
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
    
    // Save checkpoint to server with complete registration data
    const completeData = {
      ...registrationData,
      [stepKey]: data
    };
    await saveCheckpointToServer(step, completeData);

    // Move to next step. On step 4, also finalize create in DB
    if (step === 1) {
      setCurrentStep(3); // Institution Details -> Add Students
    } else if (step === 3) {
      setCurrentStep(4); // Add Students -> Payment
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
        const ok = (resp?.data as any)?.success === true;
        if (ok) {
          toast({
            title: "Institution saved",
            description: "Registration details have been stored successfully.",
          });
        } else {
          toast({
            title: "Save failed",
            description: (resp?.data as any)?.message || "Could not store institution in database.",
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
      setCurrentStep(1); // Add Students -> Institution Details
    } else if (step === 4) {
      setCurrentStep(3); // Payment -> Add Students
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
        // Students data - flatten sportTeams to individual students
        students: finalData.students?.sportTeams ? 
          finalData.students.sportTeams.flatMap((team: any) => 
            team.students.map((student: any) => ({
              fname: student.fname,
              mname: student.mname,
              lname: student.lname,
              student_id: student.student_id,
              email: student.email,
              dob: student.dob,
              gender: student.gender,
              phone: student.phone,
              address: student.address || "",
              // Add sport information
              sport: team.sport,
              sportType: team.sportType,
              category: team.category,
              subCategory: team.subCategory,
              ageFrom: team.ageFrom,
              ageTo: team.ageTo
            }))
          ) : [],
        payment: finalData.payment
      };

      console.log("🔍 Debug - Creating institute with data:", instituteData);
      console.log("🔍 Debug - Students data being sent:", instituteData.students);
      
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
            if ((existingInstituteResponse.data as any)?.success) {
              instituteId = (existingInstituteResponse.data as any).data?.id;
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
          
          {currentStep !== 1 && (
            <>
              {console.log("❌ Not rendering InstitutionDetailsStep - currentStep !== 1")}
              {console.log("currentStep value:", currentStep, "Type:", typeof currentStep)}
            </>
          )}
          
          {/* Step 2 removed from flow */}
          
          {/* SportsSubCategoriesStep removed */}
          
          {currentStep === 3 && (
            <SportStudentAddStep
              initialData={{
                students: registrationData.students?.students || [],
                sportTeams: registrationData.students?.sportTeams || [],
              }}
              onComplete={(data) => handleStepComplete(3, data)}
              onBack={() => handleBack(3)}
            />
          )}
          
          {currentStep === 4 && (
            <InstitutionPaymentStep
              institutionData={{
                ...registrationData.institutionDetails,
                students: registrationData.students?.students || [],
                sportTeams: registrationData.students?.sportTeams || [],
                instituteId: registrationData.instituteId,
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