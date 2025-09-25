import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Heart, AlertTriangle, Mail, Phone } from "lucide-react";

interface ParentMedicalStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export const ParentMedicalStep = ({ initialData, onComplete, onBack }: ParentMedicalStepProps) => {
  const [formData, setFormData] = useState({
    parentsAttending: initialData?.parentsAttending || "",
    parentName: initialData?.parentName || "",
    parentRelation: initialData?.parentRelation || "",
    parentPhone: initialData?.parentPhone || "",
    parentEmail: initialData?.parentEmail || "",
    medicalFacilities: initialData?.medicalFacilities || "",
    medicalFacilitiesDetails: initialData?.medicalFacilitiesDetails || "",
    allergiesConditions: initialData?.allergiesConditions || "",
    allergiesDetails: initialData?.allergiesDetails || "",
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.parentsAttending) newErrors.push("Please specify if parents are attending");
    
    if (formData.parentsAttending === "yes") {
      if (!formData.parentName) newErrors.push("Parent name is required");
      if (!formData.parentRelation) newErrors.push("Relation is required");
      if (!formData.parentPhone) newErrors.push("Parent phone is required");
      if (!formData.parentEmail) newErrors.push("Parent email is required");
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

  const handleSubmit = () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onComplete(formData);
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

          {/* Parents Attending Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Parents Attending?</h3>
            </div>
            
            <RadioGroup 
              value={formData.parentsAttending} 
              onValueChange={(value) => handleInputChange("parentsAttending", value)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent Name *</Label>
                  <Input
                    id="parentName"
                    placeholder="Full Name"
                    value={formData.parentName}
                    onChange={(e) => handleInputChange("parentName", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentRelation">Relation *</Label>
                  <Input
                    id="parentRelation"
                    placeholder="e.g., Father, Mother, Guardian"
                    value={formData.parentRelation}
                    onChange={(e) => handleInputChange("parentRelation", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="parentPhone"
                      placeholder="Phone Number"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="parentEmail"
                      type="email"
                      placeholder="Email Address"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
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
                <Label htmlFor="medicalDetails">Please specify medical facilities needed *</Label>
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
                <Label htmlFor="allergiesDetails">Please specify details *</Label>
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
            <Button onClick={handleSubmit} className="bg-gradient-primary">
              Save and Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};