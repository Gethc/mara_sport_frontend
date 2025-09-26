import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExportButton } from "@/components/ui/export-button";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Users,
  DollarSign,
  Trophy,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const InstitutionDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // State for API data
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidStudents: 0,
    unpaidStudents: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const response = await apiService.getInstitutionStudents({
        search: searchTerm || undefined,
        payment_status: filterStatus !== "all" ? filterStatus : undefined,
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
        // Fallback for direct array response
        const studentsData = Array.isArray(response.data) ? response.data : [];
        setStudents(studentsData);
      }
      
      // Calculate stats from the students data
      const studentsData = students;
      const totalStudents = studentsData.length;
      const paidStudents = studentsData.filter((student: any) => student.payment_status === 'Paid').length;
      const unpaidStudents = totalStudents - paidStudents;
      const totalAmount = studentsData.reduce((sum: number, student: any) => sum + (student.total_amount || 0), 0);
      const paidAmount = studentsData.filter((student: any) => student.payment_status === 'Paid')
        .reduce((sum: number, student: any) => sum + (student.paid_amount || 0), 0);
      const pendingAmount = totalAmount - paidAmount;
      
      setStats({
        totalStudents,
        paidStudents,
        unpaidStudents,
        totalAmount,
        paidAmount,
        pendingAmount,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, filterStatus]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      student.payment_status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setShowEditDialog(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    // TODO: Implement delete student API call
    toast({
      title: "Feature Coming Soon",
      description: "Delete student functionality will be implemented soon.",
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Unpaid": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Institution Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your students and track their registrations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidStudents}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Students</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unpaidStudents}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalAmount}</div>
            <p className="text-xs text-muted-foreground">All registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/institution/students'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Student Management
            </CardTitle>
            <CardDescription>
              Manage student registrations and view their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total registered students</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/institution/sports'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              Sports Management
            </CardTitle>
            <CardDescription>
              View and manage sports with enrolled students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">0</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Sports enrolled</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/institution/payments'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Payment Management
            </CardTitle>
            <CardDescription>
              Track payments and financial transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">₹{stats.totalAmount}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total amount collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <ExportButton 
                data={filteredStudents} 
                filename="students_list" 
                variant="outline"
                size="default"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>
            Manage and track your students' registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No students have been registered yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{student.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ID: {student.student_id} • {student.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={getPaymentStatusColor(student.payment_status || "Unpaid")}>
                          {student.payment_status || "Unpaid"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ₹{student.total_amount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                      onClick={() => handleEditStudent(student)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              View detailed information about {selectedStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedStudent.full_name}</p>
                    <p><span className="font-medium">Student ID:</span> {selectedStudent.student_id}</p>
                    <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                    <p><span className="font-medium">Gender:</span> {selectedStudent.gender || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Registration Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getPaymentStatusColor(selectedStudent.payment_status || "Unpaid")}`}>
                        {selectedStudent.payment_status || "Unpaid"}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Total Amount:</span> ₹{selectedStudent.total_amount || 0}</p>
                    <p><span className="font-medium">Paid Amount:</span> ₹{selectedStudent.paid_amount || 0}</p>
                    <p><span className="font-medium">Pending Amount:</span> ₹{(selectedStudent.total_amount || 0) - (selectedStudent.paid_amount || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionDashboard;