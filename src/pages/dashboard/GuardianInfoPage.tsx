import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Phone, Mail, AlertTriangle, Save } from "lucide-react";

const GuardianInfoPage = () => {
  const { student, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    parentGuardianName: student?.parentGuardianName || "",
    parentPhone: student?.parentPhone || "",
    parentEmail: student?.parentEmail || "",
    emergencyContactName: student?.emergencyContactName || "",
    emergencyContactRelation: student?.emergencyContactRelation || "",
    emergencyContactPhone: student?.emergencyContactPhone || "",
    emergencyContactEmail: student?.emergencyContactEmail || "",
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
        title: "Contact Information Updated",
        description: "Guardian and emergency contact information has been successfully updated.",
      });
      setEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update contact information. Please try again.",
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
          <h1 className="text-3xl font-bold">Guardian & Contact Information</h1>
          <p className="text-muted-foreground">
            Manage parent/guardian and emergency contact details
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Edit Contact Info
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Status Overview */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Contact Status</span>
            </CardTitle>
            <CardDescription>Overview of your contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Parent/Guardian</span>
                <Badge variant={formData.parentGuardianName ? "default" : "destructive"}>
                  {formData.parentGuardianName ? "Complete" : "Missing"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Parent Phone</span>
                <Badge variant={formData.parentPhone ? "default" : "destructive"}>
                  {formData.parentPhone ? "Added" : "Missing"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency Contact</span>
                <Badge variant={formData.emergencyContactName ? "default" : "destructive"}>
                  {formData.emergencyContactName ? "Complete" : "Missing"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency Phone</span>
                <Badge variant={formData.emergencyContactPhone ? "default" : "destructive"}>
                  {formData.emergencyContactPhone ? "Added" : "Missing"}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Required for event participation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Form */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>
                  {editing ? "Update contact information" : "Your current contact information"}
                </CardDescription>
              </div>
              {editing && (
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        parentGuardianName: student?.parentGuardianName || "",
                        parentPhone: student?.parentPhone || "",
                        parentEmail: student?.parentEmail || "",
                        emergencyContactName: student?.emergencyContactName || "",
                        emergencyContactRelation: student?.emergencyContactRelation || "",
                        emergencyContactPhone: student?.emergencyContactPhone || "",
                        emergencyContactEmail: student?.emergencyContactEmail || "",
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
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Parent/Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Parent/Guardian Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="parentName" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Parent/Guardian Name</span>
                    </Label>
                    <Input
                      id="parentName"
                      value={formData.parentGuardianName}
                      onChange={(e) => handleInputChange("parentGuardianName", e.target.value)}
                      disabled={!editing}
                      placeholder="Full name of parent or guardian"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentPhone" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                      disabled={!editing}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="parentEmail" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                      disabled={!editing}
                      placeholder="parent@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName" className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-red-500" />
                      <span>Emergency Contact Name</span>
                    </Label>
                    <Input
                      id="emergencyName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                      disabled={!editing}
                      placeholder="Full name of emergency contact"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">
                      Relationship to Participant
                    </Label>
                    <Input
                      id="emergencyRelation"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => handleInputChange("emergencyContactRelation", e.target.value)}
                      disabled={!editing}
                      placeholder="e.g., Mother, Father, Guardian, Sibling"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-red-500" />
                      <span>Emergency Phone Number</span>
                    </Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                      disabled={!editing}
                      placeholder="+1 (555) 987-6543"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyEmail" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Emergency Email</span>
                    </Label>
                    <Input
                      id="emergencyEmail"
                      type="email"
                      value={formData.emergencyContactEmail}
                      onChange={(e) => handleInputChange("emergencyContactEmail", e.target.value)}
                      disabled={!editing}
                      placeholder="emergency@example.com"
                    />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200">Important Notice</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Accurate contact information is essential for participant safety. Emergency contacts will be notified 
                immediately in case of any incidents during events. Please ensure all phone numbers are current and accessible.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardianInfoPage;