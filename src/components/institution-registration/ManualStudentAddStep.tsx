import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Plus, Trash2, Users } from "lucide-react";

interface ManualStudentAddStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface Student {
  firstName: string;
  middleName: string;
  lastName: string;
  studentId: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
}

// Gender options will be loaded from API

export const ManualStudentAddStep = ({ initialData, onComplete, onBack }: ManualStudentAddStepProps) => {
  const [students, setStudents] = useState<Student[]>(initialData?.students || []);
  const [genderOptions, setGenderOptions] = useState<{value: string, label: string}[]>([]);
  const [loadingGenderOptions, setLoadingGenderOptions] = useState(true);
  const [currentStudent, setCurrentStudent] = useState<Student>({
    firstName: "",
    middleName: "",
    lastName: "",
    studentId: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Load gender options from API
  useEffect(() => {
    const loadGenderOptions = async () => {
      try {
        const response = await apiService.getGenderOptions();
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          const responseData = response.data as any;
          if (responseData.success && responseData.data) {
            setGenderOptions(responseData.data);
          }
        }
      } catch (error) {
        console.error("Failed to load gender options:", error);
        // Fallback to default options
        setGenderOptions([
          {value: "Male", label: "Male"},
          {value: "Female", label: "Female"},
          {value: "Other", label: "Other"}
        ]);
      } finally {
        setLoadingGenderOptions(false);
      }
    };

    loadGenderOptions();
  }, []);

  const handleInputChange = (field: keyof Student, value: string) => {
    setCurrentStudent(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateStudentForm = () => {
    const newErrors: string[] = [];
    
    if (!currentStudent.firstName) newErrors.push("First Name is required");
    if (!currentStudent.lastName) newErrors.push("Last Name is required");
    if (!currentStudent.studentId) newErrors.push("Student ID is required");
    if (!currentStudent.email) newErrors.push("Email is required");
    if (!currentStudent.dateOfBirth) newErrors.push("Date of Birth is required");
    if (!currentStudent.gender) newErrors.push("Gender is required");
    if (!currentStudent.phoneNumber) newErrors.push("Phone Number is required");
    
    // Check for duplicate student ID
    const duplicateId = students.find(student => student.studentId === currentStudent.studentId);
    if (duplicateId) newErrors.push("Student ID already exists");
    
    // Check for duplicate email
    const duplicateEmail = students.find(student => student.email === currentStudent.email);
    if (duplicateEmail) newErrors.push("Email address already exists");

    return newErrors;
  };

  const addStudent = () => {
    const validationErrors = validateStudentForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStudents(prev => [...prev, currentStudent]);
    setCurrentStudent({
      firstName: "",
      middleName: "",
      lastName: "",
      studentId: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      phoneNumber: "",
    });
    setErrors([]);
  };

  const removeStudent = (index: number) => {
    setStudents(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (students.length === 0) {
      newErrors.push("Please add at least one student");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({ students });
    }
  };

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Student Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={currentStudent.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={currentStudent.middleName}
                onChange={(e) => handleInputChange("middleName", e.target.value)}
                placeholder="Enter middle name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={currentStudent.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                value={currentStudent.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                placeholder="Enter student ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={currentStudent.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={currentStudent.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={currentStudent.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {loadingGenderOptions ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    genderOptions.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>{gender.label}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={currentStudent.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={addStudent}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Added Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-16">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {`${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`}
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.dateOfBirth}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>{student.phoneNumber}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStudent(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={students.length === 0}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};