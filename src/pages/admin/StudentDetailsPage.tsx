import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Building2, Calendar, Trophy, DollarSign, CreditCard, FileText, Loader2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface StudentDetails {
  id: number;
  fname: string;
  mname?: string;
  lname: string;
  email: string;
  student_id: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  institute_id?: number;
  institute_name?: string;
  institute_type?: string;
  created_at: string;
  updated_at: string;
  sports_assignments: Array<{
    id: number;
    sport_id: number;
    sport_name: string;
    category_id?: number;
    category_name?: string;
    sub_category_id?: number;
    sub_category_name?: string;
    age_group?: string;
    gender?: string;
    fee: number;
    is_active: boolean;
    created_at: string;
  }>;
  payment_requests: Array<{
    id: number;
    amount: number;
    status: number; // 0 = pending, 1 = completed
    created_at: string;
    updated_at: string;
  }>;
}

const StudentDetailsPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fname: "",
    mname: "",
    lname: "",
    email: "",
    student_id: "",
    phone: "",
    gender: "Other",
    dob: "",
    address: "",
  });

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch student details with sports assignments and payment requests
      const response = await apiService.getStudentDetails(parseInt(studentId));
      
      console.log("🔍 StudentDetailsPage: Full API response:", response);
      console.log("🔍 StudentDetailsPage: Response data:", response.data);
      console.log("🔍 StudentDetailsPage: Response success:", response.data?.success);
      console.log("🔍 StudentDetailsPage: Response data type:", typeof response.data);
      console.log("🔍 StudentDetailsPage: Response data keys:", response.data ? Object.keys(response.data) : "No data");
      
      if (response.data && response.data.success) {
        console.log("🔍 StudentDetailsPage: Setting student data:", response.data.data);
        const studentData = response.data.data;
        setStudent(studentData);
        
        // Populate edit form
        setEditForm({
          fname: studentData.fname || "",
          mname: studentData.mname || "",
          lname: studentData.lname || "",
          email: studentData.email || "",
          student_id: studentData.student_id || "",
          phone: studentData.phone || "",
          gender: studentData.gender || "Other",
          dob: studentData.dob ? studentData.dob.split('T')[0] : "",
          address: studentData.address || "",
        });
      } else {
        console.log("🔍 StudentDetailsPage: API response not successful or missing data");
        console.log("🔍 StudentDetailsPage: response.data:", response.data);
        console.log("🔍 StudentDetailsPage: response.data.success:", response.data?.success);
        setError("Failed to fetch student details");
      }
    } catch (error: any) {
      console.error("Error fetching student details:", error);
      setError(error.message || "Failed to fetch student details");
      toast({
        title: "Error",
        description: "Failed to fetch student details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset form to original values
    if (student) {
      setEditForm({
        fname: student.fname || "",
        mname: student.mname || "",
        lname: student.lname || "",
        email: student.email || "",
        student_id: student.student_id || "",
        phone: student.phone || "",
        gender: student.gender || "Other",
        dob: student.dob ? student.dob.split('T')[0] : "",
        address: student.address || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!editForm.fname || !editForm.lname || !editForm.email || !editForm.student_id) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Call update API
      const response = await apiService.updateStudent(parseInt(studentId!), editForm);
      
      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: "Student details updated successfully",
        });
        setEditMode(false);
        // Refresh student data
        await fetchStudentDetails();
      } else {
        throw new Error(response.data?.message || "Failed to update student");
      }
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: boolean | number) => {
    if (typeof status === 'number') {
      return status === 1 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
    }
    return status ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (status: boolean | number) => {
    if (typeof status === 'number') {
      return status === 1 ? "Completed" : "Pending";
    }
    return status ? "Active" : "Inactive";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotalAmount = () => {
    if (!student?.sports_assignments) return 0;
    return student.sports_assignments.reduce((total, assignment) => total + (assignment.fee || 0), 0);
  };

  const calculatePaidAmount = () => {
    if (!student?.payment_requests) return 0;
    return student.payment_requests
      .filter(payment => payment.status === 1)
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const calculatePendingAmount = () => {
    if (!student?.payment_requests) return 0;
    return student.payment_requests
      .filter(payment => payment.status === 0)
      .reduce((total, payment) => total + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/admin-students')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || "Student not found"}</p>
              <Button onClick={() => navigate('/admin/admin-students')}>
                Back to Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = calculateTotalAmount();
  const paidAmount = calculatePaidAmount();
  const pendingAmount = calculatePendingAmount();

  return (
    <div className="container mx-auto p-6 space-y-6">
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
            <h1 className="text-3xl font-bold">Student Details</h1>
            <p className="text-muted-foreground">
              {student.fname} {student.mname} {student.lname}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fname">First Name *</Label>
              {editMode ? (
                <Input
                  id="fname"
                  value={editForm.fname}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fname: e.target.value }))}
                  placeholder="Enter first name"
                />
              ) : (
                <p className="text-lg">{student.fname}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mname">Middle Name</Label>
              {editMode ? (
                <Input
                  id="mname"
                  value={editForm.mname}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mname: e.target.value }))}
                  placeholder="Enter middle name"
                />
              ) : (
                <p className="text-lg">{student.mname || "N/A"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lname">Last Name *</Label>
              {editMode ? (
                <Input
                  id="lname"
                  value={editForm.lname}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lname: e.target.value }))}
                  placeholder="Enter last name"
                />
              ) : (
                <p className="text-lg">{student.lname}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID *</Label>
              {editMode ? (
                <Input
                  id="student_id"
                  value={editForm.student_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, student_id: e.target.value }))}
                  placeholder="Enter student ID"
                  className="font-mono"
                />
              ) : (
                <p className="text-lg font-mono">{student.student_id}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              {editMode ? (
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              ) : (
                <p className="text-lg">{student.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              {editMode ? (
                <Input
                  id="phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-lg">{student.phone || "N/A"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              {editMode ? (
                <Select value={editForm.gender} onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg">{student.gender || "N/A"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              {editMode ? (
                <Input
                  id="dob"
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                />
              ) : (
                <p className="text-lg">
                  {student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Label htmlFor="address">Address</Label>
            {editMode ? (
              <Textarea
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
                rows={3}
              />
            ) : (
              <p className="text-lg">{student.address || "N/A"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Institution Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Institution Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Institution</p>
              <p className="text-lg">{student.institute_name || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Institution Type</p>
              <p className="text-lg">{student.institute_type || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
              <p className="text-lg">
                {new Date(student.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sports Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Sports Assignments
          </CardTitle>
          <CardDescription>
            {student.sports_assignments?.length || 0} sports assigned
          </CardDescription>
        </CardHeader>
        <CardContent>
          {student.sports_assignments && student.sports_assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sport</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sub-Category</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.sports_assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.sport_name}</TableCell>
                      <TableCell>{assignment.category_name || "N/A"}</TableCell>
                      <TableCell>{assignment.sub_category_name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.age_group || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.gender || "N/A"}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(assignment.fee || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(assignment.is_active)}>
                          {getStatusText(assignment.is_active)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No sports assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            {student.payment_requests?.length || 0} payment requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {student.payment_requests && student.payment_requests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Updated Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.payment_requests.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono">#{payment.id}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.updated_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No payment requests found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetailsPage;
