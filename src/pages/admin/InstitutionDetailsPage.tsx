import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Building2, Users, Trophy, Edit, Save, X, Plus, Trash2, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { validatePhoneNumber, validateEmail, handlePhoneChange, handleEmailChange } from '@/utils/validation';

interface Institution {
  id: number;
  name: string;
  email: string;
  type: string;
  contact_persons?: Array<{
    name: string;
    email: string;
    phone: string;
    designation: string;
  }>;
  institute_information?: {
    phone_number: string;
    website: string;
    principal_name: string;
    principal_phone_number: string;
  };
  payment_info?: {
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    status: string;
  };
  payment_requests?: Array<{
    id: number;
    amount: number;
    status: string;
    status_code: number;
    created_at: string;
    updated_at: string;
    description: string;
  }>;
  students?: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: string;
    student_id: string;
  }>;
  sports_assignments?: Array<{
    id: number;
    sport_name: string;
    sport_type: string;
    fee: number;
    student_name: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

interface Sport {
  id: number;
  sport_name: string;
  sport_type: string;
  description?: string;
  fee: number;
  is_active: boolean;
  enrolled_students: number;
  payment_status?: string;
  total_amount?: number;
  paid_amount?: number;
}

interface Student {
  id: number;
  fname: string;
  mname?: string;
  lname: string;
  email: string;
  student_id: string;
  phone?: string;
  gender: string;
  dob?: string;
  address?: string;
  payment_status: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
}

const InstitutionDetailsPage: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddSportDialog, setShowAddSportDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [availableSports, setAvailableSports] = useState<any[]>([]);
  const [loadingSports, setLoadingSports] = useState(false);

  // Pagination states
  const [sportsCurrentPage, setSportsCurrentPage] = useState(1);
  const [studentsCurrentPage, setStudentsCurrentPage] = useState(1);
  const [sportsPerPage] = useState(5);
  const [studentsPerPage] = useState(5);

  // Form data for editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    contact_person_designation: '',
    phone_number: '',
    website: '',
    principal_name: '',
    principal_phone_number: ''
  });

  // Form data for adding sports
  const [sportFormData, setSportFormData] = useState({
    sport_id: '',
    fee: '',
  });

  // Form data for adding students
  const [studentFormData, setStudentFormData] = useState({
    fname: '',
    mname: '',
    lname: '',
    email: '',
    student_id: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
    selectedSports: [] as string[],
  });

  useEffect(() => {
    if (institutionId) {
      loadInstitutionDetails();
    }
  }, [institutionId]);

  const loadInstitutionDetails = async () => {
    try {
      setLoading(true);
      
      // Load institution details
      const institutionResponse = await apiService.getAdminInstitutionDetails(parseInt(institutionId || '0'));
      console.log('Institution API Response:', institutionResponse);
      if ((institutionResponse.data as any)?.success) {
        const instData = (institutionResponse.data as any).data.institution; // Access nested institution data
        console.log('Institution Data:', instData);
        console.log('Institute Information:', instData.institute_information);
        console.log('Phone Number:', instData.institute_information?.phone_number);
        console.log('Website:', instData.institute_information?.website);
        console.log('Principal Name:', instData.institute_information?.principal_name);
        console.log('Students from institution details:', instData.students);
        console.log('Sports assignments from institution details:', instData.sports_assignments);
        setInstitution(instData);
        
        // Set students from institution details response (convert to expected format)
        if (instData.students) {
          console.log('Setting students from institution details:', instData.students);
          const formattedStudents = instData.students.map((student: any) => ({
            id: student.id,
            fname: student.name.split(' ')[0] || '',
            lname: student.name.split(' ').slice(1).join(' ') || '',
            mname: '',
            email: student.email,
            phone: student.phone,
            gender: student.gender,
            student_id: student.student_id,
            dob: null,
            address: '',
            payment_status: 'Pending',
            total_amount: 0,
            paid_amount: 0,
            created_at: new Date().toISOString()
          }));
          setStudents(formattedStudents);
        }

        // Load sports with payment status from separate API
        try {
          const sportsResponse = await apiService.getInstitutionSports(parseInt(institutionId || '0'));
          if ((sportsResponse.data as any)?.success) {
            setSports((sportsResponse.data as any).data || []);
          }
        } catch (error) {
          console.error('Error loading sports:', error);
          // Fallback to sports_assignments if sports API fails
          if (instData.sports_assignments) {
            console.log('Setting sports from institution details (fallback):', instData.sports_assignments);
            const sportsMap = new Map();
            instData.sports_assignments.forEach((assignment: any) => {
              if (!sportsMap.has(assignment.sport_name)) {
                sportsMap.set(assignment.sport_name, {
                  id: assignment.id,
                  sport_name: assignment.sport_name,
                  sport_type: assignment.sport_type,
                  fee: assignment.fee,
                  enrolled_students: 1,
                  is_active: true,
                  description: '',
                  payment_status: 'No Payments',
                  total_amount: 0,
                  paid_amount: 0
                });
              } else {
                sportsMap.get(assignment.sport_name).enrolled_students += 1;
              }
            });
            setSports(Array.from(sportsMap.values()));
          }
        }
        
        // Populate form data
        setFormData({
          name: instData.name || '',
          email: instData.email || '',
          type: instData.type || '',
        contact_person_name: instData.contact_persons?.[0]?.name || '',
        contact_person_email: instData.contact_persons?.[0]?.email || '',
        contact_person_phone: instData.contact_persons?.[0]?.phone || '',
        contact_person_designation: instData.contact_persons?.[0]?.designation || '',
          phone_number: instData.institute_information?.phone_number || '',
          website: instData.institute_information?.website || '',
          principal_name: instData.institute_information?.principal_name || '',
          principal_phone_number: instData.institute_information?.principal_phone_number || ''
        });
      }

      // Note: Students and sports data are now loaded from institution details response above

    } catch (error) {
      console.error('Error loading institution details:', error);
      toast({
        title: "Error",
        description: "Failed to load institution details. Please try again.",
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
    // Reset form data to original values
    if (institution) {
      setFormData({
        name: institution.name || '',
        email: institution.email || '',
        type: institution.type || '',
        contact_person_name: institution.contact_persons?.[0]?.name || '',
        contact_person_email: institution.contact_persons?.[0]?.email || '',
        contact_person_phone: institution.contact_persons?.[0]?.phone || '',
        contact_person_designation: institution.contact_persons?.[0]?.designation || '',
        phone_number: institution.institute_information?.phone_number || '',
        website: institution.institute_information?.website || '',
        principal_name: institution.institute_information?.principal_name || '',
        principal_phone_number: institution.institute_information?.principal_phone_number || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        type: formData.type,
        contact_person_name: formData.contact_person_name,
        contact_person_email: formData.contact_person_email,
        contact_person_phone: formData.contact_person_phone,
        contact_person_designation: formData.contact_person_designation,
        phone_number: formData.phone_number,
        website: formData.website,
        principal_name: formData.principal_name,
        principal_phone_number: formData.principal_phone_number
      };

      const response = await apiService.updateInstitution(parseInt(institutionId || '0'), updateData);
      
      if ((response.data as any)?.success) {
        toast({
          title: "Success",
          description: "Institution details updated successfully",
        });
        setEditMode(false);
        // Reload data to get updated information
        await loadInstitutionDetails();
      } else {
        toast({
          title: "Error",
          description: (response.data as any)?.message || "Failed to update institution details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating institution:', error);
      toast({
        title: "Error",
        description: "Failed to update institution details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Pagination calculations
  const getSportsPaginatedData = () => {
    const startIndex = (sportsCurrentPage - 1) * sportsPerPage;
    const endIndex = startIndex + sportsPerPage;
    return sports.slice(startIndex, endIndex);
  };

  const getStudentsPaginatedData = () => {
    const startIndex = (studentsCurrentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    return students.slice(startIndex, endIndex);
  };

  const getSportsTotalPages = () => {
    return Math.ceil(sports.length / sportsPerPage);
  };

  const getStudentsTotalPages = () => {
    return Math.ceil(students.length / studentsPerPage);
  };

  // Reset pagination when data changes
  useEffect(() => {
    setSportsCurrentPage(1);
    setStudentsCurrentPage(1);
  }, [sports, students]);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "No Payments": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Load available sports for adding to institution
  const loadAvailableSports = async () => {
    try {
      setLoadingSports(true);
      const response = await apiService.getSportsPublic();
      if ((response.data as any)?.success) {
        setAvailableSports((response.data as any).data.sports || []);
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


  // Handle adding sport to institution
  const handleAddSport = async () => {
    try {
      if (!sportFormData.sport_id || !sportFormData.fee) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const sportData = {
        institution_id: parseInt(institutionId || '0'),
        sport_id: parseInt(sportFormData.sport_id),
        fee: parseFloat(sportFormData.fee),
      };

      // Call API to add sport to institution
      const response = await apiService.addInstitutionSport(sportData);
      
      if ((response.data as any)?.success) {
        toast({
          title: "Success",
          description: "Sport added to institution successfully",
        });
        setShowAddSportDialog(false);
        setSportFormData({ 
          sport_id: '', 
          fee: ''
        });
        // Reload institution details (includes sports and students data)
        await loadInstitutionDetails();
      } else {
        throw new Error((response.data as any)?.message || "Failed to add sport");
      }
    } catch (error) {
      console.error('Error adding sport:', error);
      toast({
        title: "Error",
        description: "Failed to add sport. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding student to institution
  const handleAddStudent = async () => {
    try {
      if (!studentFormData.fname || !studentFormData.lname || !studentFormData.email || !studentFormData.student_id || !studentFormData.gender || !studentFormData.dob) {
        toast({
          title: "Error",
          description: "Please fill in all required fields (First Name, Last Name, Email, Student ID, Gender, Date of Birth)",
          variant: "destructive",
        });
        return;
      }

      const studentData = {
        institution_id: parseInt(institutionId || '0'),
        fname: studentFormData.fname,
        mname: studentFormData.mname,
        lname: studentFormData.lname,
        email: studentFormData.email,
        student_id: studentFormData.student_id,
        phone: studentFormData.phone,
        gender: studentFormData.gender,
        dob: studentFormData.dob,
        address: studentFormData.address,
        selectedSports: studentFormData.selectedSports.map(sportId => parseInt(sportId)),
      };

      // Call API to add student to institution
      const response = await apiService.addInstitutionStudent(studentData);
      
      if ((response.data as any)?.success) {
        toast({
          title: "Success",
          description: "Student added to institution successfully",
        });
        setShowAddStudentDialog(false);
        setStudentFormData({
          fname: '',
          mname: '',
          lname: '',
          email: '',
          student_id: '',
          phone: '',
          gender: '',
          dob: '',
          address: '',
          selectedSports: [],
        });
        // Reload institution details (includes sports and students data)
        await loadInstitutionDetails();
      } else {
        throw new Error((response.data as any)?.message || "Failed to add student");
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading institution details...</p>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Institution Not Found</h2>
          <p className="text-gray-600 mb-4">The institution you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/admin-institutions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Institutions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/admin/admin-institutions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{institution.name}</h1>
            <p className="text-muted-foreground">Institution ID: {institution.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {editMode ? (
            <>
              <Button onClick={handleCancel} variant="outline" disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Update
            </Button>
          )}
        </div>
      </div>

      {/* Institution Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Institution Information
          </CardTitle>
          <CardDescription>
            Basic institution details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Institution Name</Label>
                {editMode ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg font-semibold mt-1">{institution.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                {editMode ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value, (value) => setFormData(prev => ({ ...prev, email: value })))}
                    className="mt-1"
                    placeholder="Enter email address"
                  />
                ) : (
                  <p className="text-lg mt-1">{institution.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Institution Type</Label>
                {editMode ? (
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primary School">Primary School</SelectItem>
                      <SelectItem value="Secondary School">Secondary School</SelectItem>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="University">University</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg mt-1">{institution.type}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                {editMode ? (
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handlePhoneChange(e.target.value, (value) => setFormData(prev => ({ ...prev, phone_number: value })))}
                    className="mt-1"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-lg mt-1">{institution.institute_information?.phone_number || "N/A"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                {editMode ? (
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg mt-1">
                    {institution.institute_information?.website ? (
                      <a 
                        href={institution.institute_information.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {institution.institute_information.website}
                      </a>
                    ) : "N/A"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="principal_name">Principal Name</Label>
                {editMode ? (
                  <Input
                    id="principal_name"
                    value={formData.principal_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, principal_name: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg mt-1">{institution.institute_information?.principal_name || "N/A"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="principal_phone_number">Principal Phone Number</Label>
                {editMode ? (
                  <Input
                    id="principal_phone_number"
                    type="tel"
                    value={formData.principal_phone_number}
                    onChange={(e) => handlePhoneChange(e.target.value, (value) => setFormData(prev => ({ ...prev, principal_phone_number: value })))}
                    className="mt-1"
                    placeholder="Enter principal phone number"
                  />
                ) : (
                  <p className="text-lg mt-1">{institution.institute_information?.principal_phone_number || "N/A"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Contact Person Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_person_name">Contact Person Name</Label>
                {editMode ? (
                  <Input
                    id="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person_name: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg mt-1">{institution.contact_persons?.[0]?.name || "N/A"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contact_person_email">Contact Person Email</Label>
                {editMode ? (
                  <Input
                    id="contact_person_email"
                    type="email"
                    value={formData.contact_person_email}
                    onChange={(e) => handleEmailChange(e.target.value, (value) => setFormData(prev => ({ ...prev, contact_person_email: value })))}
                    className="mt-1"
                    placeholder="Enter contact person email"
                  />
                ) : (
                  <p className="text-lg mt-1">{institution.contact_persons?.[0]?.email || "N/A"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contact_person_phone">Contact Person Phone</Label>
                {editMode ? (
                  <Input
                    id="contact_person_phone"
                    type="tel"
                    value={formData.contact_person_phone}
                    onChange={(e) => handlePhoneChange(e.target.value, (value) => setFormData(prev => ({ ...prev, contact_person_phone: value })))}
                    className="mt-1"
                    placeholder="Enter contact person phone"
                  />
                ) : (
                  <p className="text-lg mt-1">{institution.contact_persons?.[0]?.phone || "N/A"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contact_person_designation">Designation</Label>
                {editMode ? (
                  <Input
                    id="contact_person_designation"
                    value={formData.contact_person_designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person_designation: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg mt-1">{institution.contact_persons?.[0]?.designation || "N/A"}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Payment information and transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(institution.payment_info?.total_amount || 0)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(institution.payment_info?.paid_amount || 0)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {formatCurrency(institution.payment_info?.pending_amount || 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge 
                    variant={institution.payment_info?.status === "Paid" ? "default" : "secondary"}
                    className="text-lg px-3 py-1"
                  >
                    {institution.payment_info?.status || "Pending"}
                  </Badge>
                </div>
                <AlertCircle className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Payment Requests Table */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Payment History</h4>
            {institution.payment_requests && institution.payment_requests.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Updated Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {institution.payment_requests.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">#{payment.id}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={payment.status === "Paid" ? "default" : "secondary"}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.created_at ? formatDate(payment.created_at) : "N/A"}
                        </TableCell>
                        <TableCell>
                          {payment.updated_at ? formatDate(payment.updated_at) : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No payment requests found for this institution</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sports Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Sports Details
          </CardTitle>
          <CardDescription>
            Sports offered by this institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Enrolled Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSportsPaginatedData().length > 0 ? (
                  getSportsPaginatedData().map((sport) => (
                    <TableRow key={sport.id}>
                      <TableCell className="font-medium">{sport.sport_name}</TableCell>
                      <TableCell>{sport.sport_type}</TableCell>
                      <TableCell className="font-medium text-green-600">{formatCurrency(sport.fee)}</TableCell>
                      <TableCell>{sport.enrolled_students}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No sports found for this institution
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Sports Pagination */}
          {sports.length > sportsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((sportsCurrentPage - 1) * sportsPerPage) + 1} to {Math.min(sportsCurrentPage * sportsPerPage, sports.length)} of {sports.length} sports
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSportsCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={sportsCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {sportsCurrentPage} of {getSportsTotalPages()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSportsCurrentPage(prev => Math.min(prev + 1, getSportsTotalPages()))}
                  disabled={sportsCurrentPage === getSportsTotalPages()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {editMode && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddSportDialog(true);
                  loadAvailableSports();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sport
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Student Details
          </CardTitle>
          <CardDescription>
            Students associated with this institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Sports Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getStudentsPaginatedData().length > 0 ? (
                  getStudentsPaginatedData().map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.fname} {student.mname} {student.lname}
                      </TableCell>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.dob ? calculateAge(student.dob) : "N/A"}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {institution.sports_assignments
                            ?.filter(sa => sa.student_name === `${student.fname} ${student.lname}`)
                            .map((sport, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {sport.sport_name}
                              </Badge>
                            )) || "No sports"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No students found for this institution
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Students Pagination */}
          {students.length > studentsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((studentsCurrentPage - 1) * studentsPerPage) + 1} to {Math.min(studentsCurrentPage * studentsPerPage, students.length)} of {students.length} students
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStudentsCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={studentsCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {studentsCurrentPage} of {getStudentsTotalPages()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStudentsCurrentPage(prev => Math.min(prev + 1, getStudentsTotalPages()))}
                  disabled={studentsCurrentPage === getStudentsTotalPages()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {editMode && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddStudentDialog(true);
                  loadAvailableSports();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Sport Dialog */}
      <Dialog open={showAddSportDialog} onOpenChange={setShowAddSportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sport to Institution</DialogTitle>
            <DialogDescription>
              Select a sport from the database and assign it to this institution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="sport">Select Sport *</Label>
              <Select 
                value={sportFormData.sport_id} 
                onValueChange={(value) => setSportFormData(prev => ({ ...prev, sport_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a sport" />
                </SelectTrigger>
                <SelectContent>
                  {availableSports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id.toString()}>
                      {sport.sport_name} ({sport.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fee">Fee (KSh) *</Label>
              <Input
                id="fee"
                type="number"
                placeholder="Enter fee amount"
                value={sportFormData.fee}
                onChange={(e) => setSportFormData(prev => ({ ...prev, fee: e.target.value }))}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleAddSport} className="flex-1">
                Add Sport
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddSportDialog(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Student to Institution</DialogTitle>
            <DialogDescription>
              Add a new student to this institution with their basic information and sports assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fname">First Name *</Label>
                <Input
                  id="fname"
                  placeholder="Enter first name"
                  value={studentFormData.fname}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, fname: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="mname">Middle Name</Label>
                <Input
                  id="mname"
                  placeholder="Enter middle name"
                  value={studentFormData.mname}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, mname: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lname">Last Name *</Label>
                <Input
                  id="lname"
                  placeholder="Enter last name"
                  value={studentFormData.lname}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, lname: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  placeholder="Enter student ID"
                  value={studentFormData.student_id}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, student_id: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={studentFormData.email}
                  onChange={(e) => handleEmailChange(e.target.value, (value) => setStudentFormData(prev => ({ ...prev, email: value })))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={studentFormData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value, (value) => setStudentFormData(prev => ({ ...prev, phone: value })))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select 
                  value={studentFormData.gender} 
                  onValueChange={(value) => setStudentFormData(prev => ({ ...prev, gender: value }))}
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
              <div>
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={studentFormData.dob}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, dob: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter address"
                value={studentFormData.address}
                onChange={(e) => setStudentFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label>Select Sports</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {availableSports.map((sport) => (
                  <div key={sport.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sport-${sport.id}`}
                      checked={studentFormData.selectedSports.includes(sport.id.toString())}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStudentFormData(prev => ({
                            ...prev,
                            selectedSports: [...prev.selectedSports, sport.id.toString()]
                          }));
                        } else {
                          setStudentFormData(prev => ({
                            ...prev,
                            selectedSports: prev.selectedSports.filter(id => id !== sport.id.toString())
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`sport-${sport.id}`} className="text-sm">
                      {sport.sport_name} ({sport.sport_type})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleAddStudent} className="flex-1">
                Add Student
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddStudentDialog(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionDetailsPage;
