import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, AlertTriangle, Pill, FileText, Save } from "lucide-react";

const MedicalInfoPage = () => {
  const { student, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    medicalConditions: student?.medicalConditions || "",
    specialAssistance: student?.specialAssistance || "",
    allergies: student?.allergies || "",
    medications: student?.medications || "",
    emergencyMedicalInfo: student?.emergencyMedicalInfo || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      updateProfile(formData);
      toast({
        title: "Medical Information Updated",
        description: "Your medical information has been successfully updated.",
      });
      setEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update medical information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Information</h1>
          <p className="text-muted-foreground">
            Manage your health and medical details for safe participation
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Edit Medical Info
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical Status Overview */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Medical Status</span>
            </CardTitle>
            <CardDescription>Quick overview of your medical information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Medical Conditions</span>
                <Badge variant={formData.medicalConditions ? "secondary" : "outline"}>
                  {formData.medicalConditions ? "Specified" : "None"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Special Assistance</span>
                <Badge variant={formData.specialAssistance ? "secondary" : "outline"}>
                  {formData.specialAssistance ? "Required" : "None"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Allergies</span>
                <Badge variant={formData.allergies ? "destructive" : "outline"}>
                  {formData.allergies ? "Yes" : "None"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Medications</span>
                <Badge variant={formData.medications ? "secondary" : "outline"}>
                  {formData.medications ? "Taking" : "None"}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Keep information updated for safety</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information Form */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Medical Details</CardTitle>
                <CardDescription>
                  {editing ? "Update your medical information" : "Your current medical information"}
                </CardDescription>
              </div>
              {editing && (
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        medicalConditions: student?.medicalConditions || "",
                        specialAssistance: student?.specialAssistance || "",
                        allergies: student?.allergies || "",
                        medications: student?.medications || "",
                        emergencyMedicalInfo: student?.emergencyMedicalInfo || "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="bg-gradient-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions" className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Medical Conditions</span>
                  </Label>
                  <Textarea
                    id="medicalConditions"
                    placeholder="List any allergies, chronic illnesses, or medical conditions (leave empty if none)"
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                    disabled={!editing}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialAssistance" className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Special Assistance Requirements</span>
                  </Label>
                  <Textarea
                    id="specialAssistance"
                    placeholder="Describe any special assistance needed during events (leave empty if none)"
                    value={formData.specialAssistance}
                    onChange={(e) => handleInputChange("specialAssistance", e.target.value)}
                    disabled={!editing}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Allergies</span>
                  </Label>
                  <Textarea
                    id="allergies"
                    placeholder="List all known allergies (food, medication, environmental)"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    disabled={!editing}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications" className="flex items-center space-x-2">
                    <Pill className="h-4 w-4" />
                    <span>Current Medications</span>
                  </Label>
                  <Textarea
                    id="medications"
                    placeholder="List current medications and dosages"
                    value={formData.medications}
                    onChange={(e) => handleInputChange("medications", e.target.value)}
                    disabled={!editing}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyMedicalInfo" className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>Emergency Medical Information</span>
                  </Label>
                  <Textarea
                    id="emergencyMedicalInfo"
                    placeholder="Additional medical information for emergency situations"
                    value={formData.emergencyMedicalInfo}
                    onChange={(e) => handleInputChange("emergencyMedicalInfo", e.target.value)}
                    disabled={!editing}
                    rows={3}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">Important Notice</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                This information is crucial for your safety during sports events. Please ensure all details are accurate and up-to-date. 
                In case of medical emergencies, this information will be shared with medical personnel and event organizers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalInfoPage;