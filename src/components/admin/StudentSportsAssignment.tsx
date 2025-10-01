import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Trash2, Users, Target, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { validateAgeForAgeGroup } from "@/lib/ageValidation";
import { GENDER_OPTIONS } from "@/lib/sportsData";

interface StudentSportsAssignmentProps {
  selectedSports: Array<{
    sportId: string;
    sportName: string;
    sportType: string;
    categoryId: string;
    categoryName: string;
    subCategoryId: string;
    subCategoryName: string;
    ageGroup: string;
    gender: string;
  }>;
  onSportsChange: (sports: any[]) => void;
  studentAge?: number;
  studentGender?: string;
}

export const StudentSportsAssignment = ({ 
  selectedSports, 
  onSportsChange,
  studentAge,
  studentGender
}: StudentSportsAssignmentProps) => {
  const { toast } = useToast();
  const [sports, setSports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Current selection state
  const [selectedSportType, setSelectedSportType] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedGender, setSelectedGender] = useState("Male");

  // Age groups for selection
  const allAgeGroups = ["U6", "U8", "U10", "U12", "U14", "U16", "U18", "U20", "Senior"];
  const [availableAgeGroups, setAvailableAgeGroups] = useState<string[]>(allAgeGroups);
  const sportTypes = ["Individual", "Team"];

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSports();
      setSports((response.data as any[]) || []);
    } catch (error) {
      console.error('Error fetching sports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sports data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (sportId: string) => {
    try {
      const response = await apiService.getSportCategories(parseInt(sportId));
      setCategories((response.data as any[]) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    try {
      const response = await apiService.getSubCategories(parseInt(categoryId));
      setSubCategories((response.data as any[]) || []);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      setSubCategories([]);
    }
  };

  const fetchCategoriesBySportType = async (sportType: string) => {
    try {
      // Get all sports of the selected type
      const sportsOfType = sports.filter(sport => 
        sport.type === sportType || sport.sportType === sportType
      );
      
      // Get unique categories from these sports
      const uniqueCategories = new Map();
      sportsOfType.forEach(sport => {
        if (sport.categories) {
          sport.categories.forEach((category: any) => {
            uniqueCategories.set(category.id, category);
          });
        }
      });
      
      setCategories(Array.from(uniqueCategories.values()));
    } catch (error) {
      console.error('Error fetching categories by sport type:', error);
      setCategories([]);
    }
  };

  const populateAgeGroupsForCategory = (categoryId: string) => {
    // Find the selected category
    const category = categories.find(c => c.id === categoryId);
    if (category && category.ageGroups && category.ageGroups.length > 0) {
      // If category has specific age groups, use those
      const filteredAgeGroups = allAgeGroups.filter(ageGroup => 
        category.ageGroups.includes(ageGroup)
      );
      setAvailableAgeGroups(filteredAgeGroups.length > 0 ? filteredAgeGroups : allAgeGroups);
    } else {
      // Default to all age groups if no specific ones are defined
      setAvailableAgeGroups(allAgeGroups);
    }
  };

  const handleSportTypeChange = (sportType: string) => {
    setSelectedSportType(sportType);
    setSelectedSport("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedAgeGroup("");
    setCategories([]);
    setSubCategories([]);
    
    // Auto-populate categories for the selected sport type
    if (sportType) {
      fetchCategoriesBySportType(sportType);
    }
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedAgeGroup("");
    setCategories([]);
    setSubCategories([]);
    
    if (sportId) {
      fetchCategories(sportId);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
    setSelectedAgeGroup("");
    setSubCategories([]);
    
    if (categoryId) {
      fetchSubCategories(categoryId);
      // Auto-populate age groups based on category
      populateAgeGroupsForCategory(categoryId);
    }
  };

  const addSport = () => {
    const newErrors: string[] = [];
    
    if (!selectedSportType) newErrors.push("Please select a sport type");
    if (!selectedSport) newErrors.push("Please select a sport");
    if (!selectedCategory) newErrors.push("Please select a category");
    if (!selectedSubCategory) newErrors.push("Please select a sub-category");
    if (!selectedAgeGroup) newErrors.push("Please select an age group");
    if (!selectedGender) newErrors.push("Please select gender");
    
    // Validate age if student age is provided
    if (studentAge && selectedAgeGroup) {
      const ageValidation = validateAgeForAgeGroup(studentAge, selectedAgeGroup, false);
      if (!ageValidation.isValid) {
        newErrors.push(ageValidation.message || "Student age does not match selected age group");
      }
    }
    
    // Check for duplicates
    const duplicate = selectedSports.find(
      item => item.sportId === selectedSport && 
              item.categoryId === selectedCategory && 
              item.subCategoryId === selectedSubCategory
    );
    if (duplicate) newErrors.push("This sport combination is already assigned");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const sport = sports.find(s => s.id === selectedSport);
    const category = categories.find(c => c.id === selectedCategory);
    const subCategory = subCategories.find(sc => sc.id === selectedSubCategory);

    const newSportAssignment = {
      sportId: selectedSport,
      sportName: sport?.name || sport?.sportName || "",
      sportType: selectedSportType,
      categoryId: selectedCategory,
      categoryName: category?.name || "",
      subCategoryId: selectedSubCategory,
      subCategoryName: subCategory?.name || "",
      ageGroup: selectedAgeGroup,
      gender: selectedGender
    };

    onSportsChange([...selectedSports, newSportAssignment]);
    
    // Reset form
    setSelectedSportType("");
    setSelectedSport("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedAgeGroup("");
    setSelectedGender("Male");
    setCategories([]);
    setSubCategories([]);
    setAvailableAgeGroups(allAgeGroups);
    setErrors([]);
  };

  const removeSport = (index: number) => {
    const updatedSports = selectedSports.filter((_, i) => i !== index);
    onSportsChange(updatedSports);
  };

  const getEligibleAgeGroups = () => {
    if (!studentAge) return availableAgeGroups;
    
    // Filter age groups based on student age and available age groups
    return availableAgeGroups.filter(ageGroup => {
      const ageValue = parseInt(ageGroup.replace('U', '').replace('Senior', '21'));
      return studentAge <= ageValue;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Trophy className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading sports data...</p>
        </div>
      </div>
    );
  }

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
            <Trophy className="h-5 w-5" />
            Assign Sports to Student
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select sport type first, then choose from available categories and sub-categories
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sport Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="sportType">Sport Type *</Label>
            <Select value={selectedSportType} onValueChange={handleSportTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select sport type" />
              </SelectTrigger>
              <SelectContent>
                {sportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sport Selection */}
          <div className="space-y-2">
            <Label htmlFor="sport">Sport *</Label>
            <Select 
              value={selectedSport} 
              onValueChange={handleSportChange}
              disabled={!selectedSportType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {sports
                  .filter(sport => sport.type === selectedSportType || sport.sportType === selectedSportType)
                  .map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name || sport.sportName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedSportType && (
              <p className="text-xs text-muted-foreground">
                {sports.filter(sport => sport.type === selectedSportType || sport.sportType === selectedSportType).length} {selectedSportType.toLowerCase()} sports available
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={handleCategoryChange}
              disabled={!selectedSportType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSportType && categories.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {categories.length} categories available for {selectedSportType.toLowerCase()} sports
              </p>
            )}
          </div>

          {/* Sub-Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="subCategory">Sub-Category *</Label>
            <Select 
              value={selectedSubCategory} 
              onValueChange={setSelectedSubCategory}
              disabled={!selectedCategory || subCategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sub-category" />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((subCategory) => (
                  <SelectItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && subCategories.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {subCategories.length} sub-categories available
              </p>
            )}
          </div>

          {/* Age Group and Gender Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group *</Label>
              <Select 
                value={selectedAgeGroup} 
                onValueChange={setSelectedAgeGroup}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  {getEligibleAgeGroups().map((ageGroup) => (
                    <SelectItem key={ageGroup} value={ageGroup}>
                      {ageGroup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={selectedGender} 
                onValueChange={setSelectedGender}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <Button 
              onClick={addSport}
              disabled={!selectedSportType || !selectedSport || !selectedCategory || !selectedSubCategory || !selectedAgeGroup || !selectedGender}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sport Assignment
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedSports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Assigned Sports ({selectedSports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport Type</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sub-Category</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead className="w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSports.map((sport, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={sport.sportType === "Individual" ? "default" : "secondary"}>
                        {sport.sportType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{sport.sportName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sport.categoryName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sport.subCategoryName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{sport.ageGroup}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sport.gender}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSport(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
