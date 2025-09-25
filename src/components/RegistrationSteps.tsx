import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Calendar, School, Phone, Users, Heart, AlertTriangle, Upload, FileText } from "lucide-react";

interface RegistrationStepsProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  handleFileChange: (field: string, file: File | null) => void;
  files: any;
  agreements: any;
  setAgreements: (agreements: any) => void;
  onComplete: () => void;
}

const institutes = [
  "University of Technology",
  "State College of Engineering", 
  "National Institute of Sports",
  "City University",
  "Technical Institute",
  "Other"
];

export const RegistrationSteps = ({ formData, handleInputChange, handleFileChange, files, agreements, setAgreements, onComplete }: RegistrationStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Participant Information</h3>
              <p className="text-muted-foreground">Please provide participant's basic details</p>
            </div>
            
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Participant's Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Select value={formData.instituteName} onValueChange={(value) => handleInputChange("instituteName", value)} required>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="School / Institution / Academy / Community" />
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

            {formData.instituteName === "Other" && (
              <Input
                placeholder="Enter Institution Name"
                value={formData.otherInstitute}
                onChange={(e) => handleInputChange("otherInstitute", e.target.value)}
                required
              />
            )}

            <div className="space-y-3">
              <Label>Student ID (if applicable)</Label>
              <Input
                placeholder="Student ID / Roll Number"
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
              <p className="text-muted-foreground">Parent/Guardian contact details</p>
            </div>
            
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Parent/Guardian Full Name"
                value={formData.parentGuardianName}
                onChange={(e) => handleInputChange("parentGuardianName", e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Phone Number"
                value={formData.parentPhone}
                onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.parentEmail}
                onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Emergency Contact Information</h4>
              
              <div className="space-y-3">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Emergency Contact Full Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>

                <Input
                  placeholder="Relationship to Participant"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleInputChange("emergencyContactRelation", e.target.value)}
                  required
                />

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Emergency Contact Phone Number"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Medical Information</h3>
              <p className="text-muted-foreground">Health and medical details</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="medical" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Does the participant have any allergies, chronic illnesses, or medical conditions?</span>
              </Label>
              <Textarea
                id="medical"
                placeholder="If Yes - Please specify (leave empty if none)"
                value={formData.medicalConditions}
                onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="assistance" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Does he/she require any special assistance?</span>
              </Label>
              <Textarea
                id="assistance"
                placeholder="If Yes, please specify (leave empty if none)"
                value={formData.specialAssistance}
                onChange={(e) => handleInputChange("specialAssistance", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Document Uploads</h3>
              <p className="text-muted-foreground">Required documents for registration</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-md">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="birthCert" className="text-sm cursor-pointer font-medium">
                    Birth Certificate (Required)
                  </Label>
                  <Input
                    id="birthCert"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange("birthCertificate", e.target.files?.[0] || null)}
                    className="mt-1 text-xs"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max 10 MB. Accepted formats: PDF, JPG, PNG</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-md">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="studentId" className="text-sm cursor-pointer font-medium">
                    Student ID (if applicable)
                  </Label>
                  <Input
                    id="studentId"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange("studentIdImage", e.target.files?.[0] || null)}
                    className="mt-1 text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max 10 MB. Accepted formats: PDF, JPG, PNG</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Agreements & Terms</h3>
              <p className="text-muted-foreground">Please review and accept all agreements</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="liability"
                  checked={agreements.liability}
                  onCheckedChange={(checked) => setAgreements((prev: any) => ({ ...prev, liability: !!checked }))}
                />
                <div>
                  <Label htmlFor="liability" className="text-sm cursor-pointer font-medium">
                    Waiver and Release of Liability
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    I acknowledge participation risks and release the organizer from liability.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="dataProtection"
                  checked={agreements.dataProtection}
                  onCheckedChange={(checked) => setAgreements((prev: any) => ({ ...prev, dataProtection: !!checked }))}
                />
                <div>
                  <Label htmlFor="dataProtection" className="text-sm cursor-pointer font-medium">
                    Data Protection & Privacy Notice
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    I consent to data collection and processing as described in the privacy notice.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="terms"
                  checked={agreements.terms}
                  onCheckedChange={(checked) => setAgreements((prev: any) => ({ ...prev, terms: !!checked }))}
                />
                <div>
                  <Label htmlFor="terms" className="text-sm cursor-pointer font-medium">
                    Terms & Conditions
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    I have read and agree to the tournament rules and regulations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="privacy"
                  checked={agreements.privacy}
                  onCheckedChange={(checked) => setAgreements((prev: any) => ({ ...prev, privacy: !!checked }))}
                />
                <div>
                  <Label htmlFor="privacy" className="text-sm cursor-pointer font-medium">
                    Photography & Media Consent
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    I consent to photography and use of images for promotional purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-12 h-0.5 ml-2 ${
                i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        {currentStep === totalSteps ? (
          <Button onClick={onComplete} className="bg-gradient-primary">
            Complete Registration
          </Button>
        ) : (
          <Button onClick={nextStep}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};