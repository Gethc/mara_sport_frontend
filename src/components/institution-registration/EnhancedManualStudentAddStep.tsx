import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Plus, Trash2, Users, Trophy, Target, Users2 } from "lucide-react";
import { GENDER_OPTIONS } from "@/lib/sportsData";

interface EnhancedManualStudentAddStepProps {
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

interface SportSelection {
  sportType: string;
  sport: string;
  category: string;
  subCategory: string;
  maxStudents: number;
}

interface StudentGroup {
  id: string;
  sportSelection: SportSelection;
  students: Student[];
}

// Gender options will be loaded from API

// Sport data structure
const sportData = {
  "Individual": {
    "Tennis": {
      "Singles": {
        "Under-18 Boys": { maxStudents: 1, gender: "Male" },
        "Under-18 Girls": { maxStudents: 1, gender: "Female" },
        "Under-21 Boys": { maxStudents: 1, gender: "Male" },
        "Under-21 Girls": { maxStudents: 1, gender: "Female" },
        "Open Men": { maxStudents: 1, gender: "Male" },
        "Open Women": { maxStudents: 1, gender: "Female" }
      },
      "Doubles": {
        "Under-18 Boys": { maxStudents: 2, gender: "Male" },
        "Under-18 Girls": { maxStudents: 2, gender: "Female" },
        "Under-21 Boys": { maxStudents: 2, gender: "Male" },
        "Under-21 Girls": { maxStudents: 2, gender: "Female" },
        "Open Men": { maxStudents: 2, gender: "Male" },
        "Open Women": { maxStudents: 2, gender: "Female" },
        "Mixed": { maxStudents: 2, gender: "Mixed" }
      }
    },
    "Swimming": {
      "Freestyle": {
        "50m Under-18": { maxStudents: 1, gender: "Open" },
        "100m Under-18": { maxStudents: 1, gender: "Open" },
        "200m Under-18": { maxStudents: 1, gender: "Open" },
        "50m Under-21": { maxStudents: 1, gender: "Open" },
        "100m Under-21": { maxStudents: 1, gender: "Open" },
        "200m Under-21": { maxStudents: 1, gender: "Open" }
      },
      "Backstroke": {
        "50m Under-18": { maxStudents: 1, gender: "Open" },
        "100m Under-18": { maxStudents: 1, gender: "Open" },
        "50m Under-21": { maxStudents: 1, gender: "Open" },
        "100m Under-21": { maxStudents: 1, gender: "Open" }
      }
    },
    "Athletics": {
      "Track Events": {
        "100m Sprint": { maxStudents: 1, gender: "Open" },
        "200m Sprint": { maxStudents: 1, gender: "Open" },
        "400m Sprint": { maxStudents: 1, gender: "Open" },
        "800m Run": { maxStudents: 1, gender: "Open" },
        "1500m Run": { maxStudents: 1, gender: "Open" }
      },
      "Field Events": {
        "Long Jump": { maxStudents: 1, gender: "Open" },
        "High Jump": { maxStudents: 1, gender: "Open" },
        "Shot Put": { maxStudents: 1, gender: "Open" },
        "Discus Throw": { maxStudents: 1, gender: "Open" }
      }
    }
  },
  "Team": {
    "Football": {
      "Main Team": {
        "Under-18": { maxStudents: 7, gender: "Mixed" },
        "Under-21": { maxStudents: 7, gender: "Mixed" },
        "Open": { maxStudents: 7, gender: "Mixed" }
      }
    },
    "Basketball": {
      "Main Team": {
        "Under-16 Boys": { maxStudents: 5, gender: "Male" },
        "Under-16 Girls": { maxStudents: 5, gender: "Female" },
        "Under-19 Boys": { maxStudents: 5, gender: "Male" },
        "Under-19 Girls": { maxStudents: 5, gender: "Female" },
        "Open Men": { maxStudents: 5, gender: "Male" },
        "Open Women": { maxStudents: 5, gender: "Female" }
      }
    },
    "Volleyball": {
      "Main Team": {
        "Under-18 Boys": { maxStudents: 6, gender: "Male" },
        "Under-18 Girls": { maxStudents: 6, gender: "Female" },
        "Under-21 Boys": { maxStudents: 6, gender: "Male" },
        "Under-21 Girls": { maxStudents: 6, gender: "Female" },
        "Open Men": { maxStudents: 6, gender: "Male" },
        "Open Women": { maxStudents: 6, gender: "Female" }
      }
    },
    "Cricket": {
      "Main Team": {
        "Under-18": { maxStudents: 11, gender: "Mixed" },
        "Under-21": { maxStudents: 11, gender: "Mixed" },
        "Open": { maxStudents: 11, gender: "Mixed" }
      }
    }
  }
};

export const EnhancedManualStudentAddStep = ({ initialData, onComplete, onBack }: EnhancedManualStudentAddStepProps) => {
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>(initialData?.studentGroups || []);
  const [genderOptions, setGenderOptions] = useState<{value: string, label: string}[]>([]);
  const [loadingGenderOptions, setLoadingGenderOptions] = useState(true);
  const [currentGroup, setCurrentGroup] = useState<StudentGroup>({
    id: "",
    sportSelection: {
      sportType: "",
      sport: "",
      category: "",
      subCategory: "",
      maxStudents: 0
    },
    students: []
  });
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
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

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

  // Update available sports when sport type changes
  useEffect(() => {
    if (currentGroup.sportSelection.sportType) {
      const sports = Object.keys(sportData[currentGroup.sportSelection.sportType as keyof typeof sportData] || {});
      setAvailableSports(sports);
      setAvailableCategories([]);
      setAvailableSubCategories([]);
      setCurrentGroup(prev => ({
        ...prev,
        sportSelection: {
          ...prev.sportSelection,
          sport: "",
          category: "",
          subCategory: "",
          maxStudents: 0
        }
      }));
    }
  }, [currentGroup.sportSelection.sportType]);

  // Update available categories when sport changes
  useEffect(() => {
    if (currentGroup.sportSelection.sportType && currentGroup.sportSelection.sport) {
      const categories = Object.keys(
        sportData[currentGroup.sportSelection.sportType as keyof typeof sportData]?.[currentGroup.sportSelection.sport] || {}
      );
      setAvailableCategories(categories);
      setAvailableSubCategories([]);
      setCurrentGroup(prev => ({
        ...prev,
        sportSelection: {
          ...prev.sportSelection,
          category: "",
          subCategory: "",
          maxStudents: 0
        }
      }));
    }
  }, [currentGroup.sportSelection.sport]);

  // Update available sub-categories when category changes
  useEffect(() => {
    if (currentGroup.sportSelection.sportType && currentGroup.sportSelection.sport && currentGroup.sportSelection.category) {
      const subCategories = Object.keys(
        sportData[currentGroup.sportSelection.sportType as keyof typeof sportData]?.[currentGroup.sportSelection.sport]?.[currentGroup.sportSelection.category] || {}
      );
      setAvailableSubCategories(subCategories);
      setCurrentGroup(prev => ({
        ...prev,
        sportSelection: {
          ...prev.sportSelection,
          subCategory: "",
          maxStudents: 0
        }
      }));
    }
  }, [currentGroup.sportSelection.category]);

  // Update max students when sub-category changes
  useEffect(() => {
    if (currentGroup.sportSelection.sportType && currentGroup.sportSelection.sport && currentGroup.sportSelection.category && currentGroup.sportSelection.subCategory) {
      const subCategoryData = sportData[currentGroup.sportSelection.sportType as keyof typeof sportData]?.[currentGroup.sportSelection.sport]?.[currentGroup.sportSelection.category]?.[currentGroup.sportSelection.subCategory];
      if (subCategoryData) {
        setCurrentGroup(prev => ({
          ...prev,
          sportSelection: {
            ...prev.sportSelection,
            maxStudents: subCategoryData.maxStudents
          }
        }));
      }
    }
  }, [currentGroup.sportSelection.subCategory]);

  const handleSportSelectionChange = (field: keyof SportSelection, value: string) => {
    setCurrentGroup(prev => ({
      ...prev,
      sportSelection: {
        ...prev.sportSelection,
        [field]: value
      }
    }));
    setErrors([]);
  };

  const handleStudentInputChange = (field: keyof Student, value: string) => {
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
    
    // Check for duplicate student ID across all groups
    const duplicateId = studentGroups.some(group => 
      group.students.some(student => student.studentId === currentStudent.studentId)
    );
    if (duplicateId) newErrors.push("Student ID already exists");
    
    // Check for duplicate email across all groups
    const duplicateEmail = studentGroups.some(group => 
      group.students.some(student => student.email === currentStudent.email)
    );
    if (duplicateEmail) newErrors.push("Email address already exists");

    return newErrors;
  };

  const addStudentToCurrentGroup = () => {
    const validationErrors = validateStudentForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (currentGroup.students.length >= currentGroup.sportSelection.maxStudents) {
      setErrors([`Maximum ${currentGroup.sportSelection.maxStudents} students allowed for this sport category`]);
      return;
    }

    setCurrentGroup(prev => ({
      ...prev,
      students: [...prev.students, currentStudent]
    }));
    
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

  const removeStudentFromCurrentGroup = (index: number) => {
    setCurrentGroup(prev => ({
      ...prev,
      students: prev.students.filter((_, i) => i !== index)
    }));
  };

  const saveCurrentGroup = () => {
    if (!currentGroup.sportSelection.sportType || !currentGroup.sportSelection.sport || 
        !currentGroup.sportSelection.category || !currentGroup.sportSelection.subCategory) {
      setErrors(["Please complete sport selection"]);
      return;
    }

    if (currentGroup.students.length === 0) {
      setErrors(["Please add at least one student to this group"]);
      return;
    }

    if (currentGroup.students.length !== currentGroup.sportSelection.maxStudents) {
      setErrors([`Please add exactly ${currentGroup.sportSelection.maxStudents} students for this sport category`]);
      return;
    }

    const newGroup: StudentGroup = {
      id: `group_${Date.now()}`,
      sportSelection: { ...currentGroup.sportSelection },
      students: [...currentGroup.students]
    };

    setStudentGroups(prev => [...prev, newGroup]);
    setCurrentGroup({
      id: "",
      sportSelection: {
        sportType: "",
        sport: "",
        category: "",
        subCategory: "",
        maxStudents: 0
      },
      students: []
    });
    setErrors([]);
  };

  const removeGroup = (groupId: string) => {
    setStudentGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (studentGroups.length === 0) {
      newErrors.push("Please add at least one student group");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({ studentGroups });
    }
  };

  const getSportTypeIcon = (sportType: string) => {
    return sportType === "Individual" ? <Target className="h-4 w-4" /> : <Users2 className="h-4 w-4" />;
  };

  const getSportTypeColor = (sportType: string) => {
    return sportType === "Individual" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
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

      {/* Sport Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Sport Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sportType">Sport Type *</Label>
              <Select 
                value={currentGroup.sportSelection.sportType} 
                onValueChange={(value) => handleSportSelectionChange("sportType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Select 
                value={currentGroup.sportSelection.sport} 
                onValueChange={(value) => handleSportSelectionChange("sport", value)}
                disabled={!currentGroup.sportSelection.sportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {availableSports.map((sport) => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={currentGroup.sportSelection.category} 
                onValueChange={(value) => handleSportSelectionChange("category", value)}
                disabled={!currentGroup.sportSelection.sport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub-Category *</Label>
              <Select 
                value={currentGroup.sportSelection.subCategory} 
                onValueChange={(value) => handleSportSelectionChange("subCategory", value)}
                disabled={!currentGroup.sportSelection.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map((subCategory) => (
                    <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentGroup.sportSelection.maxStudents > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getSportTypeIcon(currentGroup.sportSelection.sportType)}
                <Badge className={getSportTypeColor(currentGroup.sportSelection.sportType)}>
                  {currentGroup.sportSelection.sportType}
                </Badge>
                <span className="font-medium">{currentGroup.sportSelection.sport}</span>
                <span className="text-muted-foreground">→</span>
                <span>{currentGroup.sportSelection.category}</span>
                <span className="text-muted-foreground">→</span>
                <span>{currentGroup.sportSelection.subCategory}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Maximum {currentGroup.sportSelection.maxStudents} student{currentGroup.sportSelection.maxStudents !== 1 ? 's' : ''} allowed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Students to Current Group */}
      {currentGroup.sportSelection.maxStudents > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Students to {currentGroup.sportSelection.sport} - {currentGroup.sportSelection.subCategory}
              <Badge variant="outline">
                {currentGroup.students.length}/{currentGroup.sportSelection.maxStudents}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={currentStudent.firstName}
                  onChange={(e) => handleStudentInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={currentStudent.middleName}
                  onChange={(e) => handleStudentInputChange("middleName", e.target.value)}
                  placeholder="Enter middle name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={currentStudent.lastName}
                  onChange={(e) => handleStudentInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  value={currentStudent.studentId}
                  onChange={(e) => handleStudentInputChange("studentId", e.target.value)}
                  placeholder="Enter student ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentStudent.email}
                  onChange={(e) => handleStudentInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={currentStudent.dateOfBirth}
                  onChange={(e) => handleStudentInputChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={currentStudent.gender} onValueChange={(value) => handleStudentInputChange("gender", value)}>
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
                  onChange={(e) => handleStudentInputChange("phoneNumber", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={addStudentToCurrentGroup}
                disabled={currentGroup.students.length >= currentGroup.sportSelection.maxStudents}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>

            {currentGroup.students.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Current Group Students ({currentGroup.students.length}/{currentGroup.sportSelection.maxStudents})</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead className="w-16">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentGroup.students.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {`${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`}
                          </TableCell>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.gender}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeStudentFromCurrentGroup(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {currentGroup.students.length === currentGroup.sportSelection.maxStudents && (
              <div className="flex justify-end">
                <Button onClick={saveCurrentGroup}>
                  Save Group
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Saved Groups */}
      {studentGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Saved Student Groups ({studentGroups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentGroups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getSportTypeIcon(group.sportSelection.sportType)}
                      <Badge className={getSportTypeColor(group.sportSelection.sportType)}>
                        {group.sportSelection.sportType}
                      </Badge>
                      <span className="font-medium">{group.sportSelection.sport}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{group.sportSelection.category}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{group.sportSelection.subCategory}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {group.students.length} students
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.students.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {`${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`}
                            </TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.dateOfBirth}</TableCell>
                            <TableCell>{student.gender}</TableCell>
                            <TableCell>{student.phoneNumber}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={studentGroups.length === 0}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};


