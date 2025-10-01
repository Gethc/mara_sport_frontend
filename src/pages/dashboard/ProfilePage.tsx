import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Upload, User, Mail, Calendar, School, IdCard, Camera, FileText, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { student, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    fname: "",
    mname: "",
    lname: "",
    email: "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
    student_id: "",
  });

  // Fetch profile data from API
  const fetchProfileData = async () => {
    try {
      setFetching(true);
      console.log('🔄 Fetching profile data...');
      
      const response = await apiService.getStudentProfile();
      console.log('📊 Profile API Response:', response);
      
      const data = (response.data as any)?.data;
      console.log('📋 Profile Data:', data);
      
      if (data) {
        setProfileData(data);
        setFormData({
          fname: data.fname || "",
          mname: data.mname || "",
          lname: data.lname || "",
          email: data.email || "",
          dob: data.dob || "",
          gender: data.gender || "",
          phone: data.phone || "",
          address: data.address || "",
          student_id: data.student_id || "",
        });
        console.log('✅ Profile data set successfully');
      } else {
        console.log('❌ No profile data received');
        toast({
          title: "Warning",
          description: "No profile data received from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error fetching profile data:', error);
      toast({
        title: "Error",
        description: `Failed to fetch profile data: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Profile Management</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

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
                <AvatarImage src={profileData?.profilePicture} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                  {profileData ? `${profileData.fname?.[0] || ''}${profileData.lname?.[0] || ''}` : 'S'}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">
                  {profileData ? `${profileData.fname} ${profileData.mname} ${profileData.lname}` : 'Loading...'}
                </h3>
                <p className="text-sm text-muted-foreground">{profileData?.email || 'Loading...'}</p>
                <Badge variant={profileData?.is_verified ? "default" : "destructive"}>
                  {profileData?.is_verified ? "Email Verified" : "Email Pending"}
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
                  <span className="font-medium">
                    {profileData ? (profileData.registration_complete ? "100%" : "In Progress") : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email Status</span>
                  <span className="font-medium">
                    {profileData ? (profileData.is_verified ? "Verified" : "Pending") : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Student ID</span>
                  <span className="font-medium">{profileData?.student_id || "Loading..."}</span>
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
              {!editing ? (
                <Button 
                  onClick={() => setEditing(true)}
                  className="bg-gradient-primary"
                  disabled={fetching}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditing(false);
                      // Reset form data to original values
                      if (profileData) {
                        setFormData({
                          fname: profileData.fname || "",
                          mname: profileData.mname || "",
                          lname: profileData.lname || "",
                          email: profileData.email || "",
                          dob: profileData.dob || "",
                          gender: profileData.gender || "",
                          phone: profileData.phone || "",
                          address: profileData.address || "",
                          student_id: profileData.student_id || "",
                        });
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="bg-gradient-primary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fname">First Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="fname"
                      value={formData.fname}
                      onChange={(e) => handleInputChange("fname", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mname">Middle Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="mname"
                      value={formData.mname}
                      onChange={(e) => handleInputChange("mname", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lname">Last Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="lname"
                      value={formData.lname}
                      onChange={(e) => handleInputChange("lname", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student_id">Student ID <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="student_id"
                      value={formData.student_id}
                      onChange={(e) => handleInputChange("student_id", e.target.value)}
                      className="pl-10"
                      disabled={!editing}
                      required
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