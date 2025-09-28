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
  

  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    studentId: "",
    sport: "",
    subCategory: "",
  });

  const [sportsOptions, setSportsOptions] = useState<{[k:string]: string[]}>({});
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch students and sports data
  useEffect(() => {
    fetchStudents();
    fetchSportsOptions();
  }, [searchTerm, filterSport]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInstitutionStudents({
        search: searchTerm || undefined
      });
      
      // Handle institution API response format
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const data = response.data as any;
        if (data.success && data.data) {
          const studentsData = data.data.students || [];
          setStudents(studentsData);
        } else {
          setStudents([]);
        }
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Student Added Successfully",
      description: `${newStudent.firstName} ${newStudent.lastName} has been added to the system.`,
    });
    setNewStudent({
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      studentId: "",
      sport: "",
      subCategory: "",
    });
    setShowAddDialog(false);
  };

  const startEditStudent = (student: any) => {
    setEditingStudent(student);
    setShowEditDialog(true);
  };

  const handleEditSave = () => {
    toast({ title: "Student updated", description: `${editingStudent?.name} updated.` });
    setShowEditDialog(false);
  };


  const filteredStudents = students.filter(student => 
    (student.name || student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterSport === "all" || filterSport === "" || (student.sports || []).some((sport: string) => sport.toLowerCase().includes(filterSport.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Add and manage student registrations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
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
                    <Label htmlFor="firstName">First Name</Label>
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
                    <Label htmlFor="lastName">Last Name</Label>
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
                    <Label>Gender</Label>
                    <Select value={newStudent.gender} onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value }))}>
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
                    <Label htmlFor="dob">Date of Birth</Label>
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
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="studentId">Student ID</Label>
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
                  <Label>Sport</Label>
                  <Select value={newStudent.sport} onValueChange={(value) => setNewStudent(prev => ({ ...prev, sport: value, subCategory: "" }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(sportsOptions).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub-category</Label>
                  <Select value={newStudent.subCategory} onValueChange={(value) => setNewStudent(prev => ({ ...prev, subCategory: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(sportsOptions[newStudent.sport] || []).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label>First Name</Label>
                  <Input defaultValue={editingStudent.name.split(' ')[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue={editingStudent.name.split(' ').slice(1).join(' ')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={editingStudent.email} />
                </div>
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input defaultValue={editingStudent.studentId} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sport</Label>
                <Select defaultValue={editingStudent.sports[0] || ""}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(sportsOptions).map((s)=>(
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={()=>setShowEditDialog(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-primary">Save</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionStudentManagement;