import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, X, User, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { calculateAge, validateAgeForAgeGroup, getValidAgeGroups } from "@/lib/ageValidation";
import { SPORTS_GENDER_OPTIONS } from "@/lib/sportsData";

interface AddStudentToSportDialogProps {
  selectedSport?: any;
  onClose: () => void;
  onSave: () => void;
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: string;
  institutionId: string;
  dob: string;
}

interface Sport {
  id: string;
  name: string;
  type: string;
  categories: Array<{
    id: string;
    name: string;
    subCategories: Array<{
      id: string;
      name: string;
      gender: string;
      level: number;
    }>;
  }>;
}

interface SportAssignment {
  sportId: string;
  sportName: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  ageGroup: string;
  gender: string;
}

const AddStudentToSportDialog = ({ selectedSport, onClose, onSave }: AddStudentToSportDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedGender, setSelectedGender] = useState("Male");
  
  const [sportAssignments, setSportAssignments] = useState<SportAssignment[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  
  const [availableAgeGroups] = useState([
    "Under 12", "12-14", "15-17", "18-20", "21-23", "24-26", "27-29", "30-35", "36-40", "41-45", "46-50", "51+"
  ]);
  
  // Get valid age groups for the selected student
  const getValidAgeGroupsForStudent = () => {
    if (!selectedStudent) return availableAgeGroups;
    
    const studentAge = calculateAge(selectedStudent.dob);
    const validGroups = getValidAgeGroups(studentAge, true);
    return validGroups.map(group => group.label);
  };
  

  useEffect(() => {
    fetchStudents();
    fetchSports();
  }, []);

  // Auto-select sport if provided
  useEffect(() => {
    if (selectedSport) {
      setSelectedSportId(selectedSport.id);
    }
  }, [selectedSport]);

  // Removed dummy data - using real data from API only

  useEffect(() => {
    const filtered = students.filter(student =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  useEffect(() => {
    if (selectedSportId) {
      const sport = sports.find(s => s.id === selectedSportId);
      if (sport) {
        setCategories(sport.categories);
        setSelectedCategory("");
        setSelectedSubCategory("");
      }
    }
  }, [selectedSportId, sports]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        setSubCategories(category.subCategories);
        setSelectedSubCategory("");
      }
    }
  }, [selectedCategory, categories]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInstitutionStudents();
      
      if (response.data && (response.data as any).data && (response.data as any).data.students) {
        // Transform the response to match the expected interface
        const transformedStudents = (response.data as any).data.students.map((student: any) => ({
          id: student.id.toString(),
          studentId: student.student_id || '',
          firstName: student.fname || '',
          lastName: student.lname || '',
          fullName: `${student.fname || ''} ${student.lname || ''}`.trim(),
          age: student.dob ? calculateAge(student.dob) : 18, // Calculate age from DOB
          gender: student.gender || 'Other',
          institutionId: student.institute_id?.toString() || '',
          dob: student.dob || ''
        }));
        setStudents(transformedStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await apiService.getInstitutionSports();
      
      if (response.data && (response.data as any).data && (response.data as any).data.sports) {
        // Transform the response to match the expected interface
        const transformedSports = (response.data as any).data.sports.map((sport: any) => ({
          id: sport.id,
          name: sport.name,
          type: sport.type,
          categories: sport.categories || []
        }));
        setSports(transformedSports);
      } else {
        setSports([]);
      }
    } catch (error) {
      console.error("Error fetching sports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sports",
        variant: "destructive",
      });
      setSports([]);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSportAssignments([]);
    
    // If sport is pre-selected, auto-assign with default values
    if (selectedSport && selectedSport.categories && selectedSport.categories.length > 0) {
      const firstCategory = selectedSport.categories[0];
      const firstSubCategory = firstCategory.subCategories && firstCategory.subCategories.length > 0 
        ? firstCategory.subCategories[0] 
        : null;
      
      if (firstSubCategory) {
        const assignment: SportAssignment = {
          sportId: selectedSport.id,
          sportName: selectedSport.name,
          categoryId: firstCategory.id,
          categoryName: firstCategory.name,
          subCategoryId: firstSubCategory.id,
          subCategoryName: firstSubCategory.name,
          ageGroup: selectedStudent && selectedStudent.dob ? 
            getValidAgeGroupsForStudent()[0] || "U10" : "U10",
          gender: "Male",
        };
        
        setSportAssignments([assignment]);
        
        // Set form values
        setSelectedSportId(selectedSport.id);
        setSelectedCategory(firstCategory.id);
        setSelectedSubCategory(firstSubCategory.id);
        setSelectedAgeGroup("18-20");
        setSelectedGender("Male");
      }
    }
  };

  const handleAddSportAssignment = () => {
    if (!selectedSportId || !selectedCategory || !selectedSubCategory || !selectedAgeGroup) {
      toast({
        title: "Error",
        description: "Please fill in all sport assignment details",
        variant: "destructive",
      });
      return;
    }

    // Validate student age against selected age group
    if (selectedStudent) {
      const studentAge = calculateAge(selectedStudent.dob);
      const ageValidation = validateAgeForAgeGroup(studentAge, selectedAgeGroup, true);
      
      if (!ageValidation.isValid) {
        toast({
          title: "Age Validation Error",
          description: ageValidation.message,
          variant: "destructive",
        });
        return;
      }
    }

    const sport = sports.find(s => s.id === selectedSportId);
    const category = categories.find(c => c.id === selectedCategory);
    const subCategory = subCategories.find(sc => sc.id === selectedSubCategory);

    if (!sport || !category || !subCategory) return;

    const assignment: SportAssignment = {
      sportId: selectedSportId,
      sportName: sport.name,
      categoryId: selectedCategory,
      categoryName: category.name,
      subCategoryId: selectedSubCategory,
      subCategoryName: subCategory.name,
      ageGroup: selectedAgeGroup,
      gender: selectedGender,
    };

    // Check if this exact assignment already exists
    const exists = sportAssignments.some(
      a => a.sportId === assignment.sportId && 
           a.categoryId === assignment.categoryId && 
           a.subCategoryId === assignment.subCategoryId
    );

    if (exists) {
      toast({
        title: "Error",
        description: "This sport assignment already exists",
        variant: "destructive",
      });
      return;
    }

    setSportAssignments([...sportAssignments, assignment]);
    
    // Reset form (but keep the sport if it was pre-selected)
    if (!selectedSport) {
      setSelectedSportId("");
    }
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedAgeGroup("");
    setSelectedGender("Male");
  };

  const handleRemoveAssignment = (index: number) => {
    setSportAssignments(sportAssignments.filter((_, i) => i !== index));
  };

  const handleAssignSports = async () => {
    try {
      setLoading(true);
      setErrors([]);

      if (!selectedStudent) {
        setErrors(["Please select a student"]);
        return;
      }

      if (sportAssignments.length === 0) {
        setErrors(["Please add at least one sport assignment"]);
        return;
      }

      // Prepare assignment data
      const assignments = sportAssignments.map(assignment => ({
        sportId: assignment.sportId,
        categoryId: assignment.categoryId,
        subCategoryId: assignment.subCategoryId,
        ageGroup: assignment.ageGroup,
        gender: assignment.gender,
      }));

      // Assign sports to student
      await apiService.assignStudentSports(parseInt(selectedStudent.id), {
        assignments,
      });

      // Calculate total amount for sports (₹500 per sport)
      const totalAmount = sportAssignments.length * 500;

      // Update student's total amount
      const paymentData = {
        status: "Unpaid", // Set as unpaid initially
        amount: 0, // No payment made yet
        method: "Pending",
        total_amount: totalAmount
      };

      // Update student payment information
      await apiService.processStudentPayment(parseInt(selectedStudent.id), paymentData);

      toast({
        title: "Success",
        description: `${sportAssignments.length} sport(s) assigned to ${selectedStudent.fullName} successfully. Total amount: ₹${totalAmount}`,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error("Error assigning sports:", error);
      toast({
        title: "Error",
        description: "Failed to assign sports to student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "Male": return "bg-blue-100 text-blue-800";
      case "Female": return "bg-pink-100 text-pink-800";
      case "Open": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Assign Sports to Student</DialogTitle>
          <DialogDescription>
            Select sports and categories for the student. You can assign multiple sports with different age groups and categories.
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Student</h3>
            
            {/* Search Students */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Students List */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading students...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No students found</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudent?.id === student.id;
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 ${
                            isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                          }`}>
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                ✓
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{student.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {student.studentId} • Age: {student.age} • 
                              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${getGenderColor(student.gender)}`}>
                                {student.gender}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{selectedStudent.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {selectedStudent.studentId} • Age: {selectedStudent.age}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sport Assignment */}
          {selectedStudent && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assign Sports</h3>
              
              {/* Sport Selection Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport <span className="text-red-500">*</span></Label>
                  <Select value={selectedSportId} onValueChange={setSelectedSportId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name} ({sport.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                    disabled={!selectedSportId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategory">Sub-Category <span className="text-red-500">*</span></Label>
                  <Select 
                    value={selectedSubCategory} 
                    onValueChange={setSelectedSubCategory}
                    disabled={!selectedCategory || subCategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.id}>
                          {subCategory.name} ({subCategory.gender})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group <span className="text-red-500">*</span></Label>
                  <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {getValidAgeGroupsForStudent().map((ageGroup) => (
                        <SelectItem key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS_GENDER_OPTIONS.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button 
                    onClick={handleAddSportAssignment}
                    disabled={!selectedSportId || !selectedCategory || !selectedSubCategory || !selectedAgeGroup}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </div>
              </div>

              {/* Current Assignments */}
              {sportAssignments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-medium">Current Assignments ({sportAssignments.length})</h4>
                  <div className="space-y-2">
                    {sportAssignments.map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">{assignment.sportName}</div>
                            <div className="text-sm text-muted-foreground">
                              {assignment.categoryName} • {assignment.subCategoryName} • {assignment.ageGroup}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getGenderColor(assignment.gender)}>
                            {assignment.gender}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveAssignment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignSports} 
            disabled={loading || !selectedStudent || sportAssignments.length === 0}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Assign {sportAssignments.length} Sport{sportAssignments.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentToSportDialog;