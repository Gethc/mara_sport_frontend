import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Plus, Trash2, Users, Trophy, Target, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface SportStudentAddStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

// Constants
const SPORT_TYPES = ["Individual", "Team"];
const AGE_CATEGORIES = ["U9", "U11", "U13", "U15", "U17", "U19"];
const GENDER_OPTIONS = ["Open", "Male", "Female", "Mixed"];

interface Student {
  fname: string;
  mname: string;
  lname: string;
  student_id: string;
  email: string;
  dob: string;
  gender: string;
  phone: string;
  
  // Computed properties for backward compatibility
  firstName?: string;
  middleName?: string;
  lastName?: string;
  studentId?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

interface SportTeam {
  id: string;
  sportType: string;
  sport: string;
  category: string;
  subCategory: string;
  ageFrom: string;
  ageTo: string;
  gender: string;
  students: Student[];
  maxStudents: number;
  sportId: number;
  categoryId?: number;
  subCategoryId?: number;
}

const genderOptions = ["Male", "Female", "Other"];

export const SportStudentAddStep = ({ initialData, onComplete, onBack }: SportStudentAddStepProps) => {
  const { toast } = useToast();
  const [sportTeams, setSportTeams] = useState<SportTeam[]>(initialData?.sportTeams || []);
  
  // State for API data
  const [sports, setSports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSportType, setCurrentSportType] = useState("Individual");
  const [currentSport, setCurrentSport] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSubCategory, setCurrentSubCategory] = useState("");
  const [currentAgeFrom, setCurrentAgeFrom] = useState("");
  const [currentAgeTo, setCurrentAgeTo] = useState("");
  const [currentGender, setCurrentGender] = useState("Open");
  
  const [currentStudent, setCurrentStudent] = useState<Student>({
    fname: "",
    mname: "",
    lname: "",
    student_id: "",
    email: "",
    dob: "",
    gender: "",
    phone: "",
    
    // Backward compatibility
    firstName: "",
    middleName: "",
    lastName: "",
    studentId: "",
    dateOfBirth: "",
    phoneNumber: "",
  });
  
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  // Load sports data from API
  useEffect(() => {
    const fetchSports = async () => {
      console.log("🔄 Loading sports data for student assignment...");
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getSportsPublic();
        console.log("📥 Sports API response:", response);
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          const responseData = response.data as any;
          if (responseData.success && responseData.data) {
            const sportsData = responseData.data || [];
            console.log("✅ Sports loaded:", sportsData);
            setSports(sportsData);
          } else {
            console.log("❌ Failed to fetch sports data");
            setError("Failed to fetch sports data");
          }
        } else {
          console.log("❌ Invalid response format");
          setError("Failed to fetch sports data");
        }
      } catch (err) {
        console.error("❌ Error fetching sports:", err);
        setError("Failed to fetch sports data");
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  // Load categories when sport changes
  useEffect(() => {
    const fetchCategories = async () => {
      console.log("🔄 Loading categories for sport:", currentSport);
      if (!currentSport) {
        console.log("❌ No sport selected, clearing categories");
        setCategories([]);
        setSubCategories([]);
        return;
      }

      try {
        const selectedSport = sports.find(sport => sport.name === currentSport);
        console.log("🎯 Selected sport data:", selectedSport);
        if (selectedSport) {
          console.log("📡 Calling API for sport ID:", selectedSport.id);
          const response = await apiService.getSportCategoriesPublic(selectedSport.id);
          console.log("📥 Categories API response:", response);
          if (response.data && (response.data as any).success) {
            const categoriesData = (response.data as any).data || [];
            console.log("✅ Categories loaded:", categoriesData);
            setCategories(categoriesData);
          } else {
            console.log("❌ Failed to load categories");
            setCategories([]);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
        setCategories([]);
      }
      
      // Reset sub-categories when sport changes
      setSubCategories([]);
      setCurrentCategory("");
      setCurrentSubCategory("");
    };

    fetchCategories();
  }, [currentSport, sports]);

  // Load sub-categories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      console.log("🔄 Loading sub-categories for category:", currentCategory, "sport:", currentSport);
      if (!currentCategory || !currentSport) {
        console.log("❌ No category or sport selected, clearing sub-categories");
        setSubCategories([]);
        return;
      }

      try {
        const selectedSport = sports.find(sport => sport.name === currentSport);
        const selectedCategory = categories.find(cat => cat.name === currentCategory);
        console.log("🎯 Selected sport:", selectedSport, "category:", selectedCategory);
        
        if (selectedSport && selectedCategory) {
          console.log("📡 Calling API for sport ID:", selectedSport.id, "category ID:", selectedCategory.id);
          const response = await apiService.getSubCategoriesPublic(selectedSport.id, selectedCategory.id);
          console.log("📥 Sub-categories API response:", response);
          if (response.data && (response.data as any).success) {
            const subCategoriesData = (response.data as any).data || [];
            console.log("✅ Sub-categories loaded:", subCategoriesData);
            setSubCategories(subCategoriesData);
          } else {
            console.log("❌ Failed to load sub-categories");
            setSubCategories([]);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching sub-categories:", err);
        setSubCategories([]);
      }
      
      // Reset sub-category selection when category changes
      setCurrentSubCategory("");
    };

    fetchSubCategories();
  }, [currentCategory, currentSport, sports, categories]);

  // Get available data based on selections
  const availableSports = sports.filter(sport => sport.type === currentSportType);
  const availableCategories = categories;
  const availableSubCategories = subCategories;
  const availableAgeGroups = AGE_CATEGORIES;

  // Get maximum students allowed for a sport based on database data
  const getMaxStudents = (sportName: string, sportType: string, subCategory: string) => {
    const selectedSport = sports.find(sport => sport.name === sportName);
    if (!selectedSport) return 1;

    // Use database max_limit if available, otherwise use defaults
    if (selectedSport.max_limit) {
      return selectedSport.max_limit;
    }

    // Fallback to default values based on sport type
    if (sportType === "Individual") {
      // Individual sports typically allow 1 student per sub-category
      // Exception: Some individual sports like Tennis Team allow 4 players
      if (sportName === "Tennis" && subCategory === "Team") return 4;
      if (sportName === "Badminton" && subCategory === "Team") return 4;
      if (sportName === "Table Tennis" && subCategory === "Team") return 4;
      if (sportName === "Padel" && subCategory === "Team") return 4;
      return 1;
    } else if (sportType === "Team") {
      // Team sports have specific player counts
      if (sportName === "Football") return 7;
      if (sportName === "Basketball") return 5;
      if (sportName === "Volleyball") return 6;
      if (sportName === "Hockey") return 7;
      if (sportName === "Netball") return 7;
      if (sportName === "Rugby (7s)") return 7;
      if (sportName === "Handball") return 7;
      if (sportName === "Cricket") return 11; // Standard cricket team
      return 7; // Default for team sports
    }
    return 1;
  };

  const addSportTeam = () => {
    const newErrors: string[] = [];
    
    if (!currentSport) newErrors.push("Please select a sport");
    if (!currentAgeFrom) newErrors.push("Please select age from");
    if (!currentAgeTo) newErrors.push("Please select age to");
    if (!currentGender) newErrors.push("Please select gender");
    
    // Validate age range
    if (currentAgeFrom && currentAgeTo) {
      const ageFromIndex = AGE_CATEGORIES.indexOf(currentAgeFrom);
      const ageToIndex = AGE_CATEGORIES.indexOf(currentAgeTo);
      if (ageFromIndex > ageToIndex) {
        newErrors.push("Age 'From' must be less than or equal to Age 'To'");
      }
    }
    
    // Find selected sport data
    const selectedSportData = sports.find(sport => sport.name === currentSport);
    const selectedCategoryData = categories.find(cat => cat.name === currentCategory);
    const selectedSubCategoryData = subCategories.find(sub => sub.name === currentSubCategory);
    
    if (!selectedSportData) {
      newErrors.push("Selected sport not found");
    }
    
    // Check for duplicates
    const duplicate = sportTeams.find(
      team => team.sportId === selectedSportData?.id && 
              team.categoryId === selectedCategoryData?.id && 
              team.subCategoryId === selectedSubCategoryData?.id &&
              team.ageFrom === currentAgeFrom &&
              team.ageTo === currentAgeTo &&
              team.gender === currentGender
    );
    if (duplicate) newErrors.push("This sport combination is already added");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const maxStudents = getMaxStudents(currentSport, currentSportType, currentSubCategory);
    const newTeam: SportTeam = {
      id: `team_${Date.now()}`,
      sportType: currentSportType,
      sport: currentSport,
      category: currentCategory || "",
      subCategory: currentSubCategory || "",
      ageFrom: currentAgeFrom,
      ageTo: currentAgeTo,
      gender: currentGender,
      students: [],
      maxStudents,
      sportId: selectedSportData?.id || 0,
      categoryId: selectedCategoryData?.id,
      subCategoryId: selectedSubCategoryData?.id
    };

    setSportTeams(prev => [...prev, newTeam]);
    
    // Reset form
    setCurrentSport("");
    setCurrentCategory("");
    setCurrentSubCategory("");
    setCurrentAgeFrom("");
    setCurrentAgeTo("");
    setCurrentGender("Open");
    setErrors([]);
    
    toast({
      title: "Sport Team Added Successfully",
      description: `${currentSport} team has been added. You can now add students to this team.`,
    });
  };

  const removeSportTeam = (teamId: string) => {
    const teamToRemove = sportTeams.find(team => team.id === teamId);
    setSportTeams(prev => prev.filter(team => team.id !== teamId));
    
    if (teamToRemove) {
      toast({
        title: "Sport Team Removed",
        description: `${teamToRemove.sport} team has been removed.`,
      });
    }
  };

  const handleStudentInputChange = (field: keyof Student, value: string) => {
    setCurrentStudent(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateStudentForm = () => {
    const newErrors: string[] = [];
    
    if (!currentStudent.fname) newErrors.push("First Name is required");
    if (!currentStudent.lname) newErrors.push("Last Name is required");
    if (!currentStudent.student_id) newErrors.push("Student ID is required");
    if (!currentStudent.email) newErrors.push("Email is required");
    if (!currentStudent.dob) newErrors.push("Date of Birth is required");
    if (!currentStudent.gender) newErrors.push("Gender is required");
    if (!currentStudent.phone) newErrors.push("Phone Number is required");
    
    if (!selectedTeamId) newErrors.push("Please select a sport team");
    
    // Check for duplicate student ID across all teams
    const duplicateId = sportTeams.some(team => 
      team.students.some(student => student.student_id === currentStudent.student_id)
    );
    if (duplicateId) newErrors.push("Student ID already exists");
    
    // Check for duplicate email across all teams
    const duplicateEmail = sportTeams.some(team => 
      team.students.some(student => student.email === currentStudent.email)
    );
    if (duplicateEmail) newErrors.push("Email address already exists");

    return newErrors;
  };

  const addStudentToTeam = () => {
    const validationErrors = validateStudentForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const selectedTeam = sportTeams.find(team => team.id === selectedTeamId);
    if (!selectedTeam) {
      setErrors(["Selected team not found"]);
      return;
    }

    if (selectedTeam.students.length >= selectedTeam.maxStudents) {
      setErrors([`Maximum ${selectedTeam.maxStudents} students allowed for ${selectedTeam.sport}`]);
      return;
    }

    setSportTeams(prev => prev.map(team => 
      team.id === selectedTeamId 
        ? { ...team, students: [...team.students, currentStudent] }
        : team
    ));

    setCurrentStudent({
      fname: "",
      mname: "",
      lname: "",
      student_id: "",
      email: "",
      dob: "",
      gender: "",
      phone: "",
      
      // Backward compatibility
      firstName: "",
      middleName: "",
      lastName: "",
      studentId: "",
      dateOfBirth: "",
      phoneNumber: "",
    });
    setSelectedTeamId("");
    setErrors([]);
    
    toast({
      title: "Student Added Successfully",
      description: `${currentStudent.fname} ${currentStudent.lname} has been added to ${selectedTeam.sport} team.`,
    });
  };

  const removeStudentFromTeam = (teamId: string, studentIndex: number) => {
    const team = sportTeams.find(team => team.id === teamId);
    const studentToRemove = team?.students[studentIndex];
    
    setSportTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, students: team.students.filter((_, index) => index !== studentIndex) }
        : team
    ));
    
    if (studentToRemove && team) {
      toast({
        title: "Student Removed",
        description: `${studentToRemove.fname} ${studentToRemove.lname} has been removed from ${team.sport} team.`,
      });
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (sportTeams.length === 0) {
      newErrors.push("Please add at least one sport team");
    }

    // Check if all teams have the required number of students
    for (const team of sportTeams) {
      if (team.students.length === 0) {
        newErrors.push(`${team.sport} team must have at least one student`);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({ sportTeams });
    }
  };

  const getTotalStudents = () => {
    return sportTeams.reduce((total, team) => total + team.students.length, 0);
  };

  return (
    <div className="space-y-6">
      {loading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading sports data...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

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

      {/* Sport Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Select Sport & Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sportType">Sport Type *</Label>
              <Select 
                value={currentSportType} 
                onValueChange={(value) => {
                  setCurrentSportType(value);
                  setCurrentSport("");
                  setCurrentCategory("");
                  setCurrentSubCategory("");
                  setCurrentAgeFrom("");
                  setCurrentAgeTo("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport type" />
                </SelectTrigger>
                <SelectContent>
                  {SPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Select 
                value={currentSport} 
                onValueChange={(value) => {
                  setCurrentSport(value);
                  setCurrentCategory("");
                  setCurrentSubCategory("");
                  setCurrentAgeFrom("");
                  setCurrentAgeTo("");
                }}
                disabled={!currentSportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {availableSports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.name}>{sport.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={currentCategory} 
                onValueChange={(value) => {
                  setCurrentCategory(value);
                  setCurrentSubCategory("");
                }}
                disabled={!currentSport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub-Category</Label>
              <Select 
                value={currentSubCategory} 
                onValueChange={setCurrentSubCategory}
                disabled={!currentCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map((subCategory) => (
                    <SelectItem key={subCategory.name} value={subCategory.name}>
                      {subCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageFrom">Age From *</Label>
              <Select 
                value={currentAgeFrom} 
                onValueChange={setCurrentAgeFrom}
                disabled={!currentSport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age from" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgeGroups.map((age) => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageTo">Age To *</Label>
              <Select 
                value={currentAgeTo} 
                onValueChange={setCurrentAgeTo}
                disabled={!currentSport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age to" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgeGroups.map((age) => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={currentGender} 
                onValueChange={setCurrentGender}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentSport && currentAgeFrom && currentAgeTo && currentGender && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Sport Info:</strong> {currentSport} ({currentSportType}) - 
                Maximum {getMaxStudents(currentSport, currentSportType, currentSubCategory)} student(s) allowed
                {currentSubCategory && ` for ${currentSubCategory}`}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={addSportTeam}
              disabled={!currentSport || !currentAgeFrom || !currentAgeTo || !currentGender}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sport Team
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Addition */}
      {sportTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Students to Teams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamSelect">Select Team *</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team to add students" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.sport} - {team.subCategory || team.category} ({team.students.length}/{team.maxStudents})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fname">First Name *</Label>
                <Input
                  id="fname"
                  value={currentStudent.fname}
                  onChange={(e) => handleStudentInputChange("fname", e.target.value)}
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mname">Middle Name</Label>
                <Input
                  id="mname"
                  value={currentStudent.mname}
                  onChange={(e) => handleStudentInputChange("mname", e.target.value)}
                  placeholder="Enter middle name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lname">Last Name *</Label>
                <Input
                  id="lname"
                  value={currentStudent.lname}
                  onChange={(e) => handleStudentInputChange("lname", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  value={currentStudent.student_id}
                  onChange={(e) => handleStudentInputChange("student_id", e.target.value)}
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
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={currentStudent.dob}
                  onChange={(e) => handleStudentInputChange("dob", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={currentStudent.gender} onValueChange={(value) => handleStudentInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={currentStudent.phone}
                  onChange={(e) => handleStudentInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={addStudentToTeam}
                disabled={!selectedTeamId || !currentStudent.firstName || !currentStudent.lastName || !currentStudent.studentId || !currentStudent.email || !currentStudent.dateOfBirth || !currentStudent.gender || !currentStudent.phoneNumber}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student to Team
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sport Teams Overview */}
      {sportTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sport Teams ({sportTeams.length}) - Total Students: {getTotalStudents()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sportTeams.map((team) => (
              <div key={team.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <h3 className="font-semibold">{team.sport}</h3>
                    <Badge variant="outline">{team.sportType}</Badge>
                    {team.category && <Badge variant="secondary">{team.category}</Badge>}
                    {team.subCategory && <Badge variant="default">{team.subCategory}</Badge>}
                    <span className="text-sm text-muted-foreground">
                      {team.ageFrom} - {team.ageTo} | {team.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {team.students.length}/{team.maxStudents} students
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSportTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {team.students.length > 0 && (
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
                        {team.students.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {`${student.fname} ${student.mname ? student.mname + ' ' : ''}${student.lname}`}
                            </TableCell>
                            <TableCell>{student.student_id}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.dob}</TableCell>
                            <TableCell>{student.gender}</TableCell>
                            <TableCell>{student.phone}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeStudentFromTeam(team.id, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={sportTeams.length === 0 || getTotalStudents() === 0}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};
