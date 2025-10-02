import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Heart, AlertTriangle, Mail, Phone, Trash2, Plus } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Parent {
  name: string;
  relation: string;
  phone: string;
  email: string;
  age: number;
}

interface ParentMedicalStepProps {
  initialData?: any;
  email?: string;
  registrationData?: any; // Add registration data to access student's date of birth
  onComplete: (data: any) => void;
  onBack: () => void;
}

export const ParentMedicalStep = ({ initialData, email, registrationData, onComplete, onBack }: ParentMedicalStepProps) => {
  const { toast } = useToast();
  const [parentPassPricing, setParentPassPricing] = useState<any>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  
  const [formData, setFormData] = useState({
    parentsAttending: initialData?.parentsAttending || "",
    parents: initialData?.parents || [] as Parent[],
    medicalFacilities: initialData?.medicalFacilities || "",
    medicalFacilitiesDetails: initialData?.medicalFacilitiesDetails || "",
    allergiesConditions: initialData?.allergiesConditions || "",
    allergiesDetails: initialData?.allergiesDetails || "",
  });
  const [parentFeeData, setParentFeeData] = useState({
    feePerParent: 0,
    pricingTier: "",
    loading: true
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load parent pass pricing on component mount
  useEffect(() => {
    loadParentPassPricing();
  }, []);

  const loadParentPassPricing = async () => {
    setIsLoadingPricing(true);
    try {
      const response = await apiService.getPricingSummary();
      const data = response.data as any;
      if (data && data.success) {
        setParentPassPricing(data.data);
      }
    } catch (error) {
      console.error("Error loading parent pass pricing:", error);
      // Fallback to default pricing if API fails
      setParentPassPricing({
        13: [{ amount: 300, pass_type: "Early Bird" }], // Under 13
        14: [{ amount: 500, pass_type: "Early Bird" }]  // 13+
      });
    } finally {
      setIsLoadingPricing(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Kenya phone number: +254 followed by 9 digits
    const phoneRegex = /^\+254\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleParentChange = (index: number, field: keyof Parent, value: string) => {
    const updatedParents = [...formData.parents];
    // Convert age to number if it's the age field
    const processedValue = field === 'age' ? parseInt(value) || 0 : value;
    updatedParents[index] = { ...updatedParents[index], [field]: processedValue };
    setFormData(prev => ({ ...prev, parents: updatedParents }));
    setErrors([]);
  };

  const addParent = () => {
    setFormData(prev => ({
      ...prev,
      parents: [...prev.parents, { name: "", relation: "", phone: "", email: "", age: 0 }]
    }));
  };

  const removeParent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parents: prev.parents.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.parentsAttending) newErrors.push("Please specify if parents are attending");
    
    if (formData.parentsAttending === "yes") {
      if (formData.parents.length === 0) {
        newErrors.push("At least one parent is required");
      } else {
        formData.parents.forEach((parent, index) => {
          if (!parent.name) newErrors.push(`Parent ${index + 1}: Name is required`);
          if (!parent.relation) newErrors.push(`Parent ${index + 1}: Relation is required`);
          
          // Phone validation
          if (!parent.phone) {
            newErrors.push(`Parent ${index + 1}: Phone number is required`);
          } else if (!validatePhone(parent.phone)) {
            newErrors.push(`Parent ${index + 1}: Phone number must start with +254 followed by 9 digits (e.g., +254712345678)`);
          }
          
          // Age validation - removed restrictions
          if (!parent.age || parent.age === 0) {
            newErrors.push(`Parent ${index + 1}: Age is required`);
          } else if (parent.age < 1) {
            newErrors.push(`Parent ${index + 1}: Age must be a positive number`);
          }
          
          // Email validation
          if (!parent.email) {
            newErrors.push(`Parent ${index + 1}: Email address is required`);
          } else if (!validateEmail(parent.email)) {
            newErrors.push(`Parent ${index + 1}: Please enter a valid email address`);
          }
        });
      }
    }
    
    if (!formData.medicalFacilities) newErrors.push("Please specify medical facility requirements");
    if (formData.medicalFacilities === "yes" && !formData.medicalFacilitiesDetails) {
      newErrors.push("Please specify medical facilities needed");
    }
    
    if (!formData.allergiesConditions) newErrors.push("Please specify if you have allergies or health conditions");
    if (formData.allergiesConditions === "yes" && !formData.allergiesDetails) {
      newErrors.push("Please specify your allergies or health conditions");
    }
    
    return newErrors;
  };

  const calculateParentFees = () => {
    if (formData.parentsAttending !== "yes" || !parentPassPricing) return 0;
    
    // Calculate total parent fees based on current pricing
    let totalFee = 0;
    formData.parents.forEach(parent => {
      const category = parent.age < 13 ? 13 : 14; // Under 13 or 13+
      const categoryPricing = parentPassPricing[category];
      if (categoryPricing && categoryPricing.length > 0) {
        // Use the first available pricing (current pricing)
        totalFee += categoryPricing[0].amount;
      }
    });
    return totalFee;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      const parentFees = calculateParentFees();
      
      // Save parent and medical information to database
      const parentMedicalData = {
        email: email || initialData?.email,
        ...formData,
        parentCount: formData.parentsAttending === "yes" ? formData.parents.length : 0
      };
      
      const response = await apiService.saveParentMedical(parentMedicalData);
      
      if (response.data && (response.data as any).success) {
        // Save registration progress
        const progressData = {
          email: email || initialData?.email,
          parent_medical: formData,
          current_phase: 3,
          completed_phases: [1, 2, 3],
          is_completed: false
        };
        
        await apiService.saveStudentRegistrationProgress(progressData);
        
        toast({
          title: "Parent & Medical Info Saved! ✅",
          description: "Your parent and medical information has been saved successfully.",
        });
        
        onComplete({
          ...formData,
          parentCount: formData.parentsAttending === "yes" ? formData.parents.length : 0
        });
      } else {
        throw new Error((response.data && (response.data as any).message) || "Failed to save parent and medical information");
      }
    } catch (error) {
      console.error("Error saving parent and medical information:", error);
      toast({
        title: "Error Saving Information",
        description: error instanceof Error ? error.message : "Failed to save parent and medical information. Please try again.",
        variant: "destructive",
      });
      setErrors(["Failed to save parent and medical information. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Parent & Medical Information</CardTitle>
          <CardDescription>
            Provide guardian details and medical information for your safety
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
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

          {isLoadingPricing && (
            <Alert>
              <AlertDescription>
                Loading parent pass pricing...
              </AlertDescription>
            </Alert>
          )}

          {parentPassPricing && formData.parentsAttending === "yes" && formData.parents.length > 0 && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Parent Pass Pricing:</p>
                  {formData.parents.map((parent, index) => {
                    const category = parent.age < 13 ? 13 : 14;
                    const categoryPricing = parentPassPricing[category];
                    const price = categoryPricing && categoryPricing.length > 0 ? categoryPricing[0].amount : 0;
                    return (
                      <div key={index} className="text-sm">
                        {parent.name || `Parent ${index + 1}`} (Age {parent.age}): KES {price}
                      </div>
                    );
                  })}
                  <div className="font-medium border-t pt-2">
                    Total Parent Pass Fee: KES {calculateParentFees()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Parents Attending Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Parents Attending?</h3>
            </div>
            
            <RadioGroup 
              value={formData.parentsAttending} 
              onValueChange={(value) => {
                handleInputChange("parentsAttending", value);
                if (value === "yes" && formData.parents.length === 0) {
                  addParent();
                } else if (value === "no") {
                  setFormData(prev => ({ ...prev, parents: [] }));
                }
              }}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="parents-yes" />
                <Label htmlFor="parents-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="parents-no" />
                <Label htmlFor="parents-no">No</Label>
              </div>
            </RadioGroup>

            {formData.parentsAttending === "yes" && (
              <div className="space-y-4">
                {formData.parents.map((parent, index) => (
                  <Card key={index} className="p-4 bg-muted/50 border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-sm">Parent {index + 1}</h4>
                      {formData.parents.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParent(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`parent-name-${index}`}>Full Name <span className="text-red-500">*</span></Label>
                        <Input
                          id={`parent-name-${index}`}
                          placeholder="Full Name"
                          value={parent.name}
                          onChange={(e) => handleParentChange(index, "name", e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`parent-relation-${index}`}>Relation <span className="text-red-500">*</span></Label>
                        <Input
                          id={`parent-relation-${index}`}
                          placeholder="e.g., Father, Mother, Guardian"
                          value={parent.relation}
                          onChange={(e) => handleParentChange(index, "relation", e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`parent-phone-${index}`}>Phone Number <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id={`parent-phone-${index}`}
                            placeholder="+254712345678"
                            value={parent.phone}
                            onChange={(e) => handleParentChange(index, "phone", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Enter phone number starting with +254 followed by 9 digits</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`parent-age-${index}`}>Age <span className="text-red-500">*</span></Label>
                        <Input
                          id={`parent-age-${index}`}
                          type="number"
                          placeholder="Age"
                          value={parent.age || ""}
                          onChange={(e) => handleParentChange(index, "age", e.target.value)}
                          min="1"
                          max="100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`parent-email-${index}`}>Email Address <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id={`parent-email-${index}`}
                            type="email"
                            placeholder="Email Address"
                            value={parent.email}
                            onChange={(e) => handleParentChange(index, "email", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addParent}
                  className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Parent
                </Button>
              </div>
            )}
          </div>

          {/* Medical Facilities Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Do You Want Any Medical Facilities?</h3>
            </div>
            
            <RadioGroup 
              value={formData.medicalFacilities} 
              onValueChange={(value) => handleInputChange("medicalFacilities", value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="medical-yes" />
                <Label htmlFor="medical-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="medical-no" />
                <Label htmlFor="medical-no">No</Label>
              </div>
            </RadioGroup>

            {formData.medicalFacilities === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="medicalDetails">Please specify medical facilities needed <span className="text-red-500">*</span></Label>
                <Textarea
                  id="medicalDetails"
                  placeholder="Describe the medical facilities or assistance you require..."
                  value={formData.medicalFacilitiesDetails}
                  onChange={(e) => handleInputChange("medicalFacilitiesDetails", e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Allergies Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="text-lg font-semibold">Any Allergies or Health Conditions?</h3>
            </div>
            
            <RadioGroup 
              value={formData.allergiesConditions} 
              onValueChange={(value) => handleInputChange("allergiesConditions", value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="allergies-yes" />
                <Label htmlFor="allergies-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="allergies-no" />
                <Label htmlFor="allergies-no">No</Label>
              </div>
            </RadioGroup>

            {formData.allergiesConditions === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="allergiesDetails">Please specify details <span className="text-red-500">*</span></Label>
                <Textarea
                  id="allergiesDetails"
                  placeholder="Describe your allergies, health conditions, medications, or any other medical information..."
                  value={formData.allergiesDetails}
                  onChange={(e) => handleInputChange("allergiesDetails", e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Parent Fee Information */}
          {formData.parentsAttending === "yes" && formData.parents.length > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium text-primary mb-2">Parent Fee Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Number of Parents:</span>
                  <span className="font-medium">{formData.parents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Parent Fees:</span>
                  <span className="font-medium">KES {calculateParentFees()}</span>
                </div>
              </div>
            </div>
          )}

          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Notice:</strong> All medical information is kept strictly confidential and will only be used for emergency situations and to provide appropriate medical assistance if needed.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};