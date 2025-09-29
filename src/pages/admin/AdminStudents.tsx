// 

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Eye, Trash2, Download, User, Building2, Calendar, Loader2, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { validateAgeForAgeGroup } from "@/lib/ageValidation";
import { StudentSportsAssignment } from "@/components/admin/StudentSportsAssignment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminStudents = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitutionType, setSelectedInstitutionType] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<any>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    student_id: "",
    institution_type: "",
    institution_name: "",
    gender: "Other",
    dob: "",
    phone: "",
    address: "",
    assignedSports: [],
  });
  
  // State for API data
  const [students, setStudents] = useState<any[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsPerPage] = useState(10);

  // Fetch students data
  const fetchStudents = async (page: number = currentPage) => {
    setStudentsLoading(true);
    try {
      const skip = (page - 1) * studentsPerPage;
      const response = await apiService.getAdminStudents({
        search: searchTerm || undefined,
        institution_type: selectedInstitutionType !== "all" ? selectedInstitutionType : undefined,
        payment_status: selectedPaymentStatus !== "all" ? selectedPaymentStatus : undefined,
        skip: skip,
        limit: studentsPerPage
      });
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        setStudents(data.data?.students || []);
        setTotalStudents(data.data?.total || 0);
      } else {
        setStudents([]);
        setTotalStudents(0);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive",
      });
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch institution types
  const fetchInstitutionTypes = async () => {
    try {
      const response = await apiService.getAdminInstitutionTypes();
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        setInstitutionTypes(data.data?.institution_types || []);
      }
    } catch (error) {
      console.error('Error fetching institution types:', error);
    }
  };
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchInstitutionTypes(), fetchStudents()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchStudents(1);
  }, [searchTerm, selectedInstitutionType, selectedPaymentStatus]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchStudents(page);
  };

  const handleViewStudent = (student: any) => {
    navigate(`/admin/admin-students/${student.id}`);
  };



  const handleDeleteStudent = (studentId: string) => {
    // TODO: Implement delete student functionality
    toast({
      title: "Feature Coming Soon",
      description: "Delete student functionality will be implemented soon.",
    });
  };

  const exportStudents = () => {
    // TODO: Implement export functionality
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be implemented soon.",
    });
  };

  const handleAddStudent = async () => {
    // Validate required fields
    const errors: string[] = [];
    if (!addForm.first_name) errors.push("First name is required");
    if (!addForm.last_name) errors.push("Last name is required");
    if (!addForm.email) errors.push("Email is required");
    if (!addForm.student_id) errors.push("Student ID is required");
    if (!addForm.institution_type) errors.push("Institution type is required");
    if (!addForm.institution_name) errors.push("Institution name is required");
    if (!addForm.gender) errors.push("Gender is required");
    if (!addForm.dob) errors.push("Date of birth is required");

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        first_name: addForm.first_name,
        middle_name: addForm.middle_name,
        last_name: addForm.last_name,
        email: addForm.email,
        student_id: addForm.student_id,
        institution_name: addForm.institution_name,
        institution_type: addForm.institution_type,
        gender: addForm.gender,
        dob: addForm.dob,
        phone: addForm.phone,
        address: addForm.address,
        assignedSports: addForm.assignedSports,
      };
      
      console.log('🔄 Creating student with payload:', payload);
      const response = await apiService.createStudent(payload);
      console.log('📥 Student creation response:', response);
      
      if (response.data && response.data.success) {
        toast({ 
          title: "Success", 
          description: `Student ${addForm.first_name} ${addForm.last_name} added successfully` 
        });
        setShowAddDialog(false);
        setAddForm({ 
          first_name: "", 
          middle_name: "", 
          last_name: "", 
          email: "", 
          student_id: "", 
          institution_type: "", 
          institution_name: "",
          gender: "Other",
          dob: "",
          phone: "",
          address: "",
          assignedSports: [] 
        });
        fetchStudents();
      } else {
        throw new Error(response.data?.message || "Failed to create student");
      }
    } catch (error: any) {
      console.error('❌ Error creating student:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add student", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleSportsChange = (sports: any[]) => {
    setAddForm(prev => ({ ...prev, assignedSports: sports }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading students data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage student registrations and profiles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportStudents} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <User className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedInstitutionType} onValueChange={setSelectedInstitutionType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Institution Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Institution Types</SelectItem>
            {institutionTypes.map((type) => (
              <SelectItem key={type.id} value={type.value}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Students</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {totalStudents} students
            </span>
          </div>
        </div>

        {studentsLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading students...</span>
            </CardContent>
          </Card>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedInstitutionType !== "all" || selectedPaymentStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No students have been registered yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(students || []).map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{student.name}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>ID: {student.id || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{student.institution_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Joined: {new Date(student.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Email:</span> {student.email}
                      </div>
                      {student.assignedSports && student.assignedSports.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {student.assignedSports.length} sport{student.assignedSports.length !== 1 ? 's' : ''}
                          </span>
                          <div className="flex gap-1">
                            {student.assignedSports.slice(0, 3).map((sport: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {sport.sportName}
                              </Badge>
                            ))}
                            {student.assignedSports.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{student.assignedSports.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalStudents > studentsPerPage && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * studentsPerPage) + 1} to {Math.min(currentPage * studentsPerPage, totalStudents)} of {totalStudents} students
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(totalStudents / studentsPerPage) }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || 
                           page === Math.ceil(totalStudents / studentsPerPage) || 
                           Math.abs(page - currentPage) <= 2;
                  })
                  .map((page, index, array) => {
                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && <span className="text-muted-foreground">...</span>}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(totalStudents / studentsPerPage)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>


      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>Add a new student with basic details and sports assignments.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="details">Student Details</TabsTrigger>
              <TabsTrigger value="sports">Sports Assignment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={addForm.first_name} onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })} />
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input value={addForm.middle_name} onChange={(e) => setAddForm({ ...addForm, middle_name: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={addForm.last_name} onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
                </div>
                <div>
                  <Label>Student ID</Label>
                  <Input value={addForm.student_id} onChange={(e) => setAddForm({ ...addForm, student_id: e.target.value })} />
                </div>
                <div />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Institute Type</Label>
                  <Select value={addForm.institution_type} onValueChange={(v) => setAddForm({ ...addForm, institution_type: v, institution_name: "" })}>
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
                </div>
                <div>
                  <Label>Institute Name</Label>
                  {addForm.institution_type === "Other" ? (
                    <Input value={addForm.institution_name} onChange={(e) => setAddForm({ ...addForm, institution_name: e.target.value })} />
                  ) : (
                    <Select value={addForm.institution_name} onValueChange={(v) => setAddForm({ ...addForm, institution_name: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select name" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {(addForm.institution_type === "Kaiso School" ? [
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
                        ] : addForm.institution_type === "Goverment School" ? [
                          "MBAGATHI ROAD PRIMARY",
                          "NEMBU PRIMARY",
                          "KAWANGWARE PRIMARY",
                          "TOI PRIMARY",
                          "RIRUTA HGM PRIMARY",
                        ] : addForm.institution_type === "Academics" ? [
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
                  )}
                </div>
                <div />
              </div>
              
              {/* Additional Required Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Gender *</Label>
                  <Select value={addForm.gender} onValueChange={(v) => setAddForm({ ...addForm, gender: v })}>
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
                <div>
                  <Label>Date of Birth *</Label>
                  <Input 
                    type="date" 
                    value={addForm.dob} 
                    onChange={(e) => setAddForm({ ...addForm, dob: e.target.value })} 
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    type="tel" 
                    value={addForm.phone} 
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} 
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Address</Label>
                  <Input 
                    value={addForm.address} 
                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} 
                    placeholder="Optional"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sports" className="space-y-4">
              <StudentSportsAssignment
                selectedSports={addForm.assignedSports}
                onSportsChange={handleSportsChange}
                studentAge={18} // You can calculate this from birth date if available
                studentGender={addForm.gender || "Open"}
              />
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStudent}>Save Student</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminStudents;