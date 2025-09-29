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


  // Fetch students from database
  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching students...');
      console.log('Auth token:', localStorage.getItem('authToken'));
      
      const response = await apiService.getInstitutionStudents();
      console.log('📥 API Response:', response);
      
      if (response.data && (response.data as any).data && (response.data as any).data.students) {
        console.log('✅ Students found:', (response.data as any).data.students);
        setStudents((response.data as any).data.students);
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

  useEffect(() => {
    fetchStudents();
  }, []);

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading students...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const fullName = `${student.fname || ''} ${student.lname || ''}`.trim();
                  const age = student.dob ? new Date().getFullYear() - new Date(student.dob).getFullYear() : 'N/A';
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm sm:text-base">{fullName || 'N/A'}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {age} years • {student.gender || 'N/A'} • {student.student_id || 'N/A'}
                          </p>
                          <div className="sm:hidden mt-1">
                            <p className="text-xs">{student.email || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{student.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          <p className="text-sm truncate max-w-[150px]">{student.email || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{student.phone || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            Registered
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.is_verified ? "default" : "secondary"} className="text-xs">
                          {student.is_verified ? "Active" : "Pending"}
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student profile and sports category.</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <form onSubmit={(e)=>{e.preventDefault();handleEditSave();}} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={editForm.firstName} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={editForm.middleName} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, middleName: e.target.value }))}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Last Name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={editForm.lastName} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input 
                    type="email"
                    value={editForm.email} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student ID <span className="text-red-500">*</span></Label>
                  <Input 
                    value={editForm.studentId} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, studentId: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number <span className="text-red-500">*</span></Label>
                  <Input 
                    value={editForm.phoneNumber} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address <span className="text-red-500">*</span></Label>
                <Input 
                  value={editForm.address} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date"
                    value={editForm.dateOfBirth} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender <span className="text-red-500">*</span></Label>
                  <Select 
                    value={editForm.gender} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value }))} 
                    required
                  >
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
                <Button type="button" variant="outline" onClick={()=>setShowEditDialog(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-primary" disabled={loading}>
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