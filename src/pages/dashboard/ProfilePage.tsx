import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, User, Mail, Calendar, School, IdCard, Camera, FileText } from "lucide-react";

const ProfilePage = () => {
  const { student, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: student?.fullName || "",
    email: student?.email || "",
    dateOfBirth: student?.dateOfBirth || "",
    gender: student?.gender || "",
    instituteName: student?.instituteName || "",
    studentId: student?.studentId || "",
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
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      setEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
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
          <h1 className="text-3xl font-bold">Profile Management</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Status */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload and manage your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={student?.profilePicture} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                  {student?.fullName?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">{student?.fullName}</h3>
                <p className="text-sm text-muted-foreground">{student?.email}</p>
                <Badge variant={student?.isEmailVerified ? "default" : "destructive"}>
                  {student?.isEmailVerified ? "Email Verified" : "Email Pending"}
                </Badge>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium">Account Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Profile Completion</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span className="font-medium">2 days ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {editing ? "Update your personal details" : "Your personal details"}
                </CardDescription>
              </div>
              {editing && (
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        fullName: student?.fullName || "",
                        email: student?.email || "",
                        dateOfBirth: student?.dateOfBirth || "",
                        gender: student?.gender || "",
                        instituteName: student?.instituteName || "",
                        studentId: student?.studentId || "",
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
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituteName">Institute Name</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="instituteName"
                      value={formData.instituteName}
                      onChange={(e) => handleInputChange("instituteName", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange("studentId", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Documents Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Uploaded Documents</span>
          </CardTitle>
          <CardDescription>View and manage your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Student ID Document</h4>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Student ID uploaded successfully
                </p>
                <Button variant="outline" size="sm">
                  View Document
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Age Proof Document</h4>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Age proof uploaded successfully
                </p>
                <Button variant="outline" size="sm">
                  View Document
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;