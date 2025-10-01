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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User, Building2, Calendar, Trophy, DollarSign, CreditCard, FileText, Loader2, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { validatePhoneNumber, validateEmail, handlePhoneChange, handleEmailChange } from "@/utils/validation";

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

  // Sports management state
  const [sportsEditMode, setSportsEditMode] = useState(false);
  const [showAddSportDialog, setShowAddSportDialog] = useState(false);
  const [availableSports, setAvailableSports] = useState<any[]>([]);
  const [sportTypes, setSportTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loadingSports, setLoadingSports] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [selectedSportFee, setSelectedSportFee] = useState<number | null>(null);
  const [sportFormData, setSportFormData] = useState({
    sport_type: '',
    sport_id: '',
    category_id: '',
    sub_category_id: '',
    age_group: '',
    gender: '',
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
        console.log("🔍 StudentDetailsPage: Sports assignments:", studentData.sports_assignments);
        console.log("🔍 StudentDetailsPage: Sports assignments length:", studentData.sports_assignments?.length);
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
    setSportsEditMode(false);
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

  // Sports management functions
  const handleSportsEdit = () => {
    setSportsEditMode(true);
    // Initialize selected sports with current assignments
    if (student?.sports_assignments) {
      setSelectedSports(student.sports_assignments.map(assignment => assignment.sport_id));
    }
  };

  const handleSportsCancel = () => {
    setSportsEditMode(false);
    setSelectedSports([]);
  };

  const handleSportsSave = async () => {
    try {
      setSaving(true);
      
      // Update student sports assignments
      const response = await apiService.updateStudentSports(parseInt(studentId), {
        sport_ids: selectedSports
      });

      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: "Sports assignments updated successfully",
        });
        setSportsEditMode(false);
        setSelectedSports([]);
        // Refresh student data
        await fetchStudentDetails();
      } else {
        throw new Error(response.data?.message || "Failed to update sports assignments");
      }
    } catch (error: any) {
      console.error('Error updating sports assignments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update sports assignments",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadAvailableSports = async () => {
    try {
      setLoadingSports(true);
      const response = await apiService.getSports();
      if (response.data && response.data.success) {
        const sports = response.data.data.sports || [];
        setAvailableSports(sports);
        
        // Extract unique sport types
        const types = [...new Set(sports.map(sport => sport.type).filter(Boolean))];
        setSportTypes(types.map(type => ({ id: type, name: type })));
      }
    } catch (error) {
      console.error('Error loading sports:', error);
      toast({
        title: "Error",
        description: "Failed to load available sports",
        variant: "destructive",
      });
    } finally {
      setLoadingSports(false);
    }
  };

  const loadCategories = async (sportId: number) => {
    try {
      setLoadingCategories(true);
      const response = await apiService.getSportCategories(sportId);
      if (response.data && response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubCategories = async (sportId: number, categoryId: number) => {
    try {
      setLoadingSubCategories(true);
      const response = await apiService.getSportSubCategories(sportId, categoryId);
      if (response.data && response.data.success) {
        setSubCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const handleAddSport = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!sportFormData.sport_type || !sportFormData.sport_id || 
          !sportFormData.age_group || !sportFormData.gender) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const response = await apiService.addStudentSport(parseInt(studentId), {
        sport_id: parseInt(sportFormData.sport_id),
        category_id: sportFormData.category_id ? parseInt(sportFormData.category_id) : null,
        sub_category_id: sportFormData.sub_category_id ? parseInt(sportFormData.sub_category_id) : null,
        age_group: sportFormData.age_group,
        gender: sportFormData.gender
      });

      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: "Sport assignment added successfully",
        });
        setShowAddSportDialog(false);
        setSportFormData({ 
          sport_type: '', 
          sport_id: '', 
          category_id: '', 
          sub_category_id: '', 
          age_group: '', 
          gender: ''
        });
        // Clear dependent data
        setCategories([]);
        setSubCategories([]);
        // Refresh student data
        await fetchStudentDetails();
      } else {
        throw new Error(response.data?.message || "Failed to add sport assignment");
      }
    } catch (error: any) {
      console.error('Error adding sport assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add sport assignment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSport = async (assignmentId: number) => {
    try {
      setSaving(true);
      
      const response = await apiService.deleteSportAssignment(assignmentId);

      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: "Sport removed successfully",
        });
        // Refresh student data
        await fetchStudentDetails();
      } else {
        throw new Error(response.data?.message || "Failed to remove sport");
      }
    } catch (error: any) {
      console.error('Error removing sport:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove sport",
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
      currency: 'KES',
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
                  onChange={(e) => handleEmailChange(e.target.value, (value) => setEditForm(prev => ({ ...prev, email: value })))}
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
                  onChange={(e) => handlePhoneChange(e.target.value, (value) => setEditForm(prev => ({ ...prev, phone: value })))}
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Sports Assignments
              </CardTitle>
              <CardDescription>
                {student.sports_assignments?.length || 0} sports assigned
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {sportsEditMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSportsCancel}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSportsSave}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          loadAvailableSports();
                          setShowAddSportDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sport
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Sport Assignment</DialogTitle>
                        <DialogDescription>
                          Assign a new sport to this student with detailed specifications
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 mt-4">
                        {/* Sport Type */}
                        <div className="space-y-2">
                          <Label htmlFor="sport-type">Sport Type <span className="text-red-500">*</span></Label>
                          <Select
                            value={sportFormData.sport_type}
                            onValueChange={(value) => {
                              setSportFormData(prev => ({ 
                                ...prev, 
                                sport_type: value,
                                sport_id: '', // Reset dependent fields
                                category_id: '',
                                sub_category_id: ''
                              }));
                              setCategories([]);
                              setSubCategories([]);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select sport type" />
                            </SelectTrigger>
                            <SelectContent>
                              {sportTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sport */}
                        <div className="space-y-2">
                          <Label htmlFor="sport-select">Sport <span className="text-red-500">*</span></Label>
                          <Select
                            value={sportFormData.sport_id}
                            onValueChange={(value) => {
                              setSportFormData(prev => ({ 
                                ...prev, 
                                sport_id: value,
                                category_id: '', // Reset dependent fields
                                sub_category_id: ''
                              }));
                              setCategories([]);
                              setSubCategories([]);
                              // Load categories for selected sport
                              if (value) {
                                loadCategories(parseInt(value));
                                // Find and set the fee for the selected sport
                                const selectedSport = availableSports.find(sport => sport.id.toString() === value);
                                if (selectedSport && selectedSport.fee) {
                                  setSelectedSportFee(selectedSport.fee);
                                } else {
                                  setSelectedSportFee(null);
                                }
                              } else {
                                setSelectedSportFee(null);
                              }
                            }}
                            disabled={!sportFormData.sport_type}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a sport" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSports
                                .filter(sport => sport.type === sportFormData.sport_type)
                                .map((sport) => (
                                  <SelectItem key={sport.id} value={sport.id.toString()}>
                                    {sport.sport_name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <Label htmlFor="category-select">Category</Label>
                          <Select
                            value={sportFormData.category_id}
                            onValueChange={(value) => {
                              setSportFormData(prev => ({ 
                                ...prev, 
                                category_id: value,
                                sub_category_id: '' // Reset dependent field
                              }));
                              setSubCategories([]);
                              // Load subcategories for selected category
                              if (value && sportFormData.sport_id) {
                                loadSubCategories(parseInt(sportFormData.sport_id), parseInt(value));
                              }
                            }}
                            disabled={!sportFormData.sport_id || loadingCategories}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sub-Category */}
                        <div className="space-y-2">
                          <Label htmlFor="sub-category-select">Sub-Category</Label>
                          <Select
                            value={sportFormData.sub_category_id}
                            onValueChange={(value) => setSportFormData(prev => ({ ...prev, sub_category_id: value }))}
                            disabled={!sportFormData.category_id || loadingSubCategories}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a sub-category (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {subCategories.map((subCategory) => (
                                <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                                  {subCategory.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Age Group and Gender Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="age-group-select">Age Group <span className="text-red-500">*</span></Label>
                            <Select
                              value={sportFormData.age_group}
                              onValueChange={(value) => setSportFormData(prev => ({ ...prev, age_group: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select age group" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="9">9 years</SelectItem>
                                <SelectItem value="10">10 years</SelectItem>
                                <SelectItem value="11">11 years</SelectItem>
                                <SelectItem value="12">12 years</SelectItem>
                                <SelectItem value="13">13 years</SelectItem>
                                <SelectItem value="14">14 years</SelectItem>
                                <SelectItem value="15">15 years</SelectItem>
                                <SelectItem value="16">16 years</SelectItem>
                                <SelectItem value="17">17 years</SelectItem>
                                <SelectItem value="18">18 years</SelectItem>
                                <SelectItem value="19">19 years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gender-select">Gender <span className="text-red-500">*</span></Label>
                            <Select
                              value={sportFormData.gender}
                              onValueChange={(value) => setSportFormData(prev => ({ ...prev, gender: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Fee Display */}
                        <div className="space-y-2">
                          <Label>Fee</Label>
                          <div className="p-3 bg-gray-50 border rounded-md">
                            {selectedSportFee !== null ? (
                              <span className="text-lg font-semibold text-gray-900">
                                KSh {selectedSportFee.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">
                                Select a sport to see the fee
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddSportDialog(false);
                              setSportFormData({ 
                                sport_type: '', 
                                sport_id: '', 
                                category_id: '', 
                                sub_category_id: '', 
                                age_group: '', 
                                gender: ''
                              });
                              setCategories([]);
                              setSubCategories([]);
                              setSelectedSportFee(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddSport}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {saving ? "Adding..." : "Add Sport Assignment"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={handleSportsEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Sports
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {console.log("🔍 StudentDetailsPage: Rendering sports assignments, student:", student)}
          {console.log("🔍 StudentDetailsPage: Sports assignments in render:", student?.sports_assignments)}
          {student.sports_assignments && student.sports_assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {sportsEditMode && <TableHead className="w-12">Select</TableHead>}
                    <TableHead>Sport</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sub-Category</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    {!sportsEditMode && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.sports_assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      {sportsEditMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedSports.includes(assignment.sport_id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSports(prev => [...prev, assignment.sport_id]);
                              } else {
                                setSelectedSports(prev => prev.filter(id => id !== assignment.sport_id));
                              }
                            }}
                          />
                        </TableCell>
                      )}
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
                      {!sportsEditMode && (
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveSport(assignment.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
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
