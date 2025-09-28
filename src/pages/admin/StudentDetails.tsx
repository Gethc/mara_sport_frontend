import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Save, X, Trophy, User, Mail, GraduationCap, Building } from "lucide-react";
import { apiService } from "@/services/api";
import { StudentSportsAssignment } from "@/components/admin/StudentSportsAssignment";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  student_id: string;
  institution_type: string;
  institution_name: string;
  gender?: string;
  assignedSports?: Array<{
    sportId: string;
    sportName: string;
    sportType: string;
    categoryId: string;
    categoryName: string;
    subCategoryId: string;
    subCategoryName: string;
    ageGroup: string;
    gender: string;
  }>;
}

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [editForm, setEditForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    student_id: "",
    institution_type: "",
    institution_name: "",
    gender: "Open",
    assignedSports: [] as any[]
  });

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      console.log('Fetching student with ID:', id);
      const response = await apiService.getStudent(id!);
      console.log('Student response:', response);
      const studentData = response.data || response;
      
      if (!studentData) {
        throw new Error('No student data received');
      }
      
      setStudent(studentData);
      setEditForm({
        first_name: studentData.first_name || "",
        middle_name: studentData.middle_name || "",
        last_name: studentData.last_name || "",
        email: studentData.email || "",
        student_id: studentData.student_id || "",
        institution_type: studentData.institution_type || "",
        institution_name: studentData.institution_name || "",
        gender: studentData.gender || "Open",
        assignedSports: studentData.assignedSports || []
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      toast({
        title: "Error",
        description: `Failed to fetch student details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setErrors([]);
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors([]);
    // Reset form to original data
    if (student) {
      setEditForm({
        first_name: student.first_name || "",
        middle_name: student.middle_name || "",
        last_name: student.last_name || "",
        email: student.email || "",
        student_id: student.student_id || "",
        institution_type: student.institution_type || "",
        institution_name: student.institution_name || "",
        gender: student.gender || "Open",
        assignedSports: student.assignedSports || []
      });
    }
  };

  const handleSave = async () => {
    const newErrors: string[] = [];
    
    if (!editForm.first_name.trim()) newErrors.push("First name is required");
    if (!editForm.last_name.trim()) newErrors.push("Last name is required");
    if (!editForm.email.trim()) newErrors.push("Email is required");
    if (!editForm.student_id.trim()) newErrors.push("Student ID is required");
    if (!editForm.institution_type) newErrors.push("Institution type is required");
    if (!editForm.institution_name.trim()) newErrors.push("Institution name is required");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      setErrors([]);

      const updateData = {
        first_name: editForm.first_name.trim(),
        middle_name: editForm.middle_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim(),
        student_id: editForm.student_id.trim(),
        institution_type: editForm.institution_type,
        institution_name: editForm.institution_name.trim(),
        gender: editForm.gender,
        assignedSports: editForm.assignedSports
      };

      await apiService.updateStudent(id!, updateData);
      
      // Update local state
      setStudent(prev => prev ? { ...prev, ...updateData } : null);
      setEditing(false);
      
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSportsChange = (sports: any[]) => {
    setEditForm(prev => ({ ...prev, assignedSports: sports }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Student not found</p>
          <Button onClick={() => navigate('/admin/admin-students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/admin-students')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {student.first_name} {student.middle_name} {student.last_name}
            </h1>
            <p className="text-muted-foreground">Student ID: {student.student_id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Student
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Alert */}
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

      {/* Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Student Details</TabsTrigger>
          <TabsTrigger value="sports">Sports Assignment</TabsTrigger>
        </TabsList>

        {/* Student Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>First Name</Label>
                  {editing ? (
                    <Input
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">{student.first_name}</p>
                  )}
                </div>
                <div>
                  <Label>Middle Name</Label>
                  {editing ? (
                    <Input
                      value={editForm.middle_name}
                      onChange={(e) => setEditForm({ ...editForm, middle_name: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">{student.middle_name || "N/A"}</p>
                  )}
                </div>
                <div>
                  <Label>Last Name</Label>
                  {editing ? (
                    <Input
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">{student.last_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  {editing ? (
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Student ID</Label>
                  {editing ? (
                    <Input
                      value={editForm.student_id}
                      onChange={(e) => setEditForm({ ...editForm, student_id: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {student.student_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Gender</Label>
                  {editing ? (
                    <Select value={editForm.gender} onValueChange={(v) => setEditForm({ ...editForm, gender: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">{student.gender || "Open"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Institution Type</Label>
                  {editing ? (
                    <Select 
                      value={editForm.institution_type} 
                      onValueChange={(v) => setEditForm({ ...editForm, institution_type: v, institution_name: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kaiso School">Kaiso School</SelectItem>
                        <SelectItem value="Goverment School">Goverment School</SelectItem>
                        <SelectItem value="Academics">Academics</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">{student.institution_type}</p>
                  )}
                </div>
                <div>
                  <Label>Institution Name</Label>
                  {editing ? (
                    editForm.institution_type === "Other" ? (
                      <Input
                        value={editForm.institution_name}
                        onChange={(e) => setEditForm({ ...editForm, institution_name: e.target.value })}
                      />
                    ) : (
                      <Select 
                        value={editForm.institution_name} 
                        onValueChange={(v) => setEditForm({ ...editForm, institution_name: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select name" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {(editForm.institution_type === "Kaiso School" ? [
                            "Aga Khan Academy",
                            "Braeburn Garden Estate - BGE",
                            "Braeburn Gitanga Road - BGR",
                            "Braeside School, Thika",
                            "Braeside School, Lavington",
                            "Brookhouse School, Karen",
                            "Brookhouse School, Runda",
                            "Brookhurst International, Lavington",
                            "Brookhurst International, Kiserian",
                            "Crawford International School",
                            "The Banda School",
                            "French School",
                            "German School",
                            "Jawabu School",
                            "Light International School",
                            "Makini Cambridge School",
                            "Nairobi Academy",
                            "Nairobi Jaffery Academy",
                            "Oshwal Academy U15 & U17",
                            "Oshwal Academy U17 & U19",
                            "Peponi School (overall)",
                            "Peponi School (Girls Sport)",
                            "Peponi School (Boys Sport)",
                            "Rosslyn Academy (overall)",
                            "Kenton College",
                            "Rusinga School",
                            "SABIS International School",
                            "St Austin's Academy",
                            "St. Christopher's School",
                            "Swedish School",
                            "Woodcreek School",
                            "West Nairobi School - WNS",
                            "ISK",
                            "Durham International School - DIS",
                          ] : editForm.institution_type === "Goverment School" ? [
                            "MBAGATHI ROAD PRIMARY",
                            "NEMBU PRIMARY",
                            "KAWANGWARE PRIMARY",
                            "TOI PRIMARY",
                            "RIRUTA HGM PRIMARY",
                          ] : editForm.institution_type === "Academics" ? [
                            "Talanta",
                            "JB Academy",
                            "Muqs",
                            "Bumble Bee Sports",
                            "Discovery Tennis",
                            "TY SPORTS",
                            "Terriffic Tennis",
                            "Next Gen Multi Sport Academu",
                          ] : []).map((n) => (
                            <SelectItem key={n} value={n}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">{student.institution_name}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sports Assignment Tab */}
        <TabsContent value="sports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Sports Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <StudentSportsAssignment
                  selectedSports={editForm.assignedSports}
                  onSportsChange={handleSportsChange}
                  studentAge={18} // You can calculate this from birth date if available
                  studentGender={editForm.gender}
                />
              ) : (
                <div className="space-y-4">
                  {student.assignedSports && student.assignedSports.length > 0 ? (
                    <div className="space-y-3">
                      {student.assignedSports.map((sport: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Trophy className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium">{sport.sportName}</div>
                              <div className="text-sm text-muted-foreground">
                                {sport.categoryName} - {sport.subCategoryName}
                                <br />
                                Age Group: {sport.ageGroup} | Gender: {sport.gender}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge variant={sport.sportType === "Individual" ? "default" : "secondary"}>
                              {sport.sportType}
                            </Badge>
                            <Badge variant="outline">
                              {sport.ageGroup}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sports assigned to this student</p>
                      <p className="text-sm">Click "Edit Student" to assign sports</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetails;