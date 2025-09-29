import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { 
  UserPlus, 
  Upload, 
  Search, 
  Filter, 
  Download,
  Edit,
  Trash2,
  Mail,
  User,
  Calendar,
  Phone,
  IdCard,
  FileText
} from "lucide-react";

const InstitutionStudentManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    studentId: "",
    phoneNumber: "",
    address: "",
  });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  const [newStudent, setNewStudent] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    studentId: "",
    phoneNumber: "",
    address: "",
  });

  const [sportsOptions, setSportsOptions] = useState<{[k:string]: string[]}>({});

  // Fetch students and sports data
  useEffect(() => {
    fetchStudents();
    fetchSportsOptions();
  }, [searchTerm, filterSport]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching students...');
      console.log('Auth token:', localStorage.getItem('authToken'));
      
      const response = await apiService.getInstitutionStudents({
        search: searchTerm || undefined
      });
      console.log('📥 API Response:', response);
      
      // Handle institution API response format
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const data = response.data as any;
        if (data.success && data.data) {
          const studentsData = data.data.students || [];
          console.log('✅ Students found:', studentsData);
          setStudents(studentsData);
        } else {
          console.log('⚠️ No students in response');
          setStudents([]);
        }
      } else {
        console.log('⚠️ No students in response');
        console.log('Response structure:', response);
        setStudents([]);
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data. Please try logging in again.",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSportsOptions = async () => {
    try {
      const response = await apiService.getAvailableSports();
      
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const data = response.data as any;
        if (data.success && data.data) {
          const sportsData = data.data || [];
          const sportsOptionsMap: {[k:string]: string[]} = {};
          
          sportsData.forEach((sport: any) => {
            const subCategories: string[] = [];
            sport.categories?.forEach((category: any) => {
              category.subCategories?.forEach((sub: any) => {
                subCategories.push(sub.name);
              });
            });
            sportsOptionsMap[sport.name] = subCategories;
          });
          
          setSportsOptions(sportsOptionsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching sports options:', error);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      
      // Map frontend form data to backend schema
      const studentData = {
        fname: newStudent.firstName,
        mname: newStudent.middleName,
        lname: newStudent.lastName,
        email: newStudent.email,
        dob: newStudent.dateOfBirth,
        gender: newStudent.gender,
        student_id: newStudent.studentId,
        phone: newStudent.phoneNumber,
        address: newStudent.address,
        institute_id: null // Will be set by backend based on authenticated user
      };
      
      console.log('🔄 Creating student with data:', studentData);
      const response = await apiService.createInstitutionStudent(studentData);
      console.log('📥 Student creation response:', response);
      
      if (response.data) {
        toast({
          title: "Student Added Successfully",
          description: `${newStudent.firstName} ${newStudent.lastName} has been added to the system.`,
        });
        
        // Reset form
      setNewStudent({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        studentId: "",
        phoneNumber: "",
        address: "",
      });
        setShowAddDialog(false);
        
        // Refresh student list
        fetchStudents();
      } else {
        throw new Error(response.message || "Failed to create student");
      }
    } catch (error: any) {
      console.error("❌ Error creating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditStudent = (student: any) => {
    setEditingStudent(student);
    // Populate edit form with student data
    setEditForm({
      firstName: student.fname || "",
      middleName: student.mname || "",
      lastName: student.lname || "",
      email: student.email || "",
      dateOfBirth: student.dob || "",
      gender: student.gender || "",
      studentId: student.student_id || "",
      phoneNumber: student.phone || "",
      address: student.address || "",
    });
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!editingStudent) return;
    
    try {
      setLoading(true);
      
      // Map frontend form data to backend schema
      const studentData = {
        fname: editForm.firstName,
        mname: editForm.middleName,
        lname: editForm.lastName,
        email: editForm.email,
        dob: editForm.dateOfBirth,
        gender: editForm.gender,
        student_id: editForm.studentId,
        phone: editForm.phoneNumber,
        address: editForm.address,
      };
      
      console.log('🔄 Updating student with data:', studentData);
      const response = await apiService.updateInstitutionStudent(editingStudent.id, studentData);
      console.log('📥 Student update response:', response);
      
      if (response.data && (response.data as any).success) {
        toast({
          title: "Student Updated Successfully",
          description: `${editForm.firstName} ${editForm.lastName} has been updated.`,
        });
        
        setShowEditDialog(false);
        
        // Refresh student list
        fetchStudents();
      } else {
        throw new Error((response.data as any)?.message || "Failed to update student");
      }
    } catch (error: any) {
      console.error('❌ Error updating student:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const filteredStudents = students.filter(student => {
    const fullName = `${student.fname || ''} ${student.lname || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For now, we'll show all students regardless of sport filter since we need to implement sport filtering
    const matchesSport = filterSport === "all" || filterSport === "";
    
    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Add and manage student registrations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={fetchStudents}>
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter student details for sports registration
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={newStudent.firstName}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, firstName: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="middleName"
                        placeholder="Enter middle name"
                        value={newStudent.middleName}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, middleName: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={newStudent.lastName}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, lastName: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender <span className="text-red-500">*</span></Label>
                    <Select value={newStudent.gender} onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value }))} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="dob"
                        type="date"
                        value={newStudent.dateOfBirth}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="studentId"
                      placeholder="Enter student ID"
                      value={newStudent.studentId}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, studentId: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter phone number"
                      value={newStudent.phoneNumber}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <Input
                      id="address"
                      placeholder="Enter address"
                      value={newStudent.address}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, address: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>


                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    Add Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterSport} onValueChange={setFilterSport}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            {filteredStudents.length} students found
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Student</TableHead>
                <TableHead className="min-w-[200px] hidden sm:table-cell">Contact</TableHead>
                <TableHead className="min-w-[150px]">Sports</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm sm:text-base">{student.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {student.age} years • {student.gender} • {student.student_id || student.studentId}
                      </p>
                      <div className="sm:hidden mt-1">
                        <p className="text-xs">{student.email}</p>
                        <p className="text-xs text-muted-foreground">{student.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div>
                      <p className="text-sm truncate max-w-[150px]">{student.email}</p>
                      <p className="text-sm text-muted-foreground">{student.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(student.sports || []).map((sport) => (
                        <Badge key={sport} variant="secondary" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                      {(!student.sports || student.sports.length === 0) && (
                        <span className="text-xs text-muted-foreground">No sports assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={(student.status || '').toLowerCase() === "active" ? "default" : "secondary"} className="text-xs">
                      {student.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" title="Edit Student" onClick={() => startEditStudent(student)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete Student" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a new student to your institution
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fname">First Name *</Label>
                <Input
                  id="fname"
                  value={newStudent.fname}
                  onChange={(e) => setNewStudent({...newStudent, fname: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mname">Middle Name</Label>
                <Input
                  id="mname"
                  value={newStudent.mname}
                  onChange={(e) => setNewStudent({...newStudent, mname: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname">Last Name *</Label>
                <Input
                  id="lname"
                  value={newStudent.lname}
                  onChange={(e) => setNewStudent({...newStudent, lname: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  value={newStudent.student_id}
                  onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={newStudent.dob}
                  onChange={(e) => setNewStudent({...newStudent, dob: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={newStudent.gender} onValueChange={(value) => setNewStudent({...newStudent, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fname">First Name *</Label>
                  <Input
                    id="edit-fname"
                    value={editingStudent.fname}
                    onChange={(e) => setEditingStudent({...editingStudent, fname: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mname">Middle Name</Label>
                  <Input
                    id="edit-mname"
                    value={editingStudent.mname}
                    onChange={(e) => setEditingStudent({...editingStudent, mname: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lname">Last Name *</Label>
                  <Input
                    id="edit-lname"
                    value={editingStudent.lname}
                    onChange={(e) => setEditingStudent({...editingStudent, lname: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-student_id">Student ID *</Label>
                  <Input
                    id="edit-student_id"
                    value={editingStudent.student_id}
                    onChange={(e) => setEditingStudent({...editingStudent, student_id: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input
                    id="edit-dob"
                    type="date"
                    value={editingStudent.dob}
                    onChange={(e) => setEditingStudent({...editingStudent, dob: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={editingStudent.gender} onValueChange={(value) => setEditingStudent({...editingStudent, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionStudentManagement;