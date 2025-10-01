import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Trash2, Users, Target } from "lucide-react";
import { 
  AGE_CATEGORIES, 
  GENDER_OPTIONS, 
  SPORT_TYPES, 
  getSportsByType,
  getCategoriesForSport,
  getSubCategoriesForSportAndCategory,
  getAgeGroupsForSport
} from "@/lib/sportsData";

interface StudentSportsSelectionProps {
  selectedSports: Array<{
    sportType: string;
    sport: string; 
    category: string;
    subCategory: string;
    ageFrom: string;
    ageTo: string;
    gender: string;
  }>;
  onSportsChange: (sports: any[]) => void;
  isEditMode?: boolean;
  studentName?: string;
}

export const StudentSportsSelection = ({ 
  selectedSports, 
  onSportsChange, 
  isEditMode = false,
  studentName = "Student"
}: StudentSportsSelectionProps) => {
  const [currentSportType, setCurrentSportType] = useState("Individual");
  const [currentSport, setCurrentSport] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSubCategory, setCurrentSubCategory] = useState("");
  const [currentAgeFrom, setCurrentAgeFrom] = useState("");
  const [currentAgeTo, setCurrentAgeTo] = useState("");
  const [currentGender, setCurrentGender] = useState("Male");
  const [errors, setErrors] = useState<string[]>([]);

  // Get available data based on selections
  const availableSports = getSportsByType(currentSportType);
  const availableCategories = currentSport ? getCategoriesForSport(currentSport) : [];
  const availableSubCategories = currentSport && currentCategory ? getSubCategoriesForSportAndCategory(currentSport, currentCategory) : [];
  const availableAgeGroups = currentSport ? getAgeGroupsForSport(currentSport, currentSportType) : AGE_CATEGORIES;

  const addSport = () => {
    const newErrors: string[] = [];
    
    if (!currentSport) newErrors.push("Please select a sport");
    if (!currentAgeFrom) newErrors.push("Please select age from");
    if (!currentAgeTo) newErrors.push("Please select age to");
    if (!currentGender) newErrors.push("Please select gender");
    
    // Check for duplicates
    const duplicate = selectedSports.find(
      item => item.sport === currentSport && 
              item.category === currentCategory && 
              item.subCategory === currentSubCategory &&
              item.ageFrom === currentAgeFrom &&
              item.ageTo === currentAgeTo
    );
    if (duplicate) newErrors.push("This sport combination is already added");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const newSport = { 
      sportType: currentSportType,
      sport: currentSport, 
      category: currentCategory || "",
      subCategory: currentSubCategory || "",
      ageFrom: currentAgeFrom,
      ageTo: currentAgeTo,
      gender: currentGender
    };

    onSportsChange([...selectedSports, newSport]);
    
    // Reset form
    setCurrentSport("");
    setCurrentCategory("");
    setCurrentSubCategory("");
    setCurrentAgeFrom("");
    setCurrentAgeTo("");
    setCurrentGender("Male");
    setErrors([]);
  };

  const removeSport = (index: number) => {
    const updatedSports = selectedSports.filter((_, i) => i !== index);
    onSportsChange(updatedSports);
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
            <Trophy className="h-5 w-5" />
            {isEditMode ? `Manage Sports for ${studentName}` : "Add Sports"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sport Type Selection */}
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

          {/* Sport Selection */}
          <div className="space-y-2">
            <Label htmlFor="sport">Sport Name *</Label>
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
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Group Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Gender Selection */}
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
                {GENDER_OPTIONS.map((gender) => (
                  <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category and Sub-Category for All Sports */}
          {currentSport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={currentCategory} 
                  onValueChange={(value) => {
                    setCurrentCategory(value);
                    setCurrentSubCategory("");
                  }}
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
            </div>
          )}

          {/* Add Button */}
          <div className="flex justify-end">
            <Button 
              onClick={addSport}
              disabled={!currentSport || !currentAgeFrom || !currentAgeTo || !currentGender}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sport
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedSports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentSportType === "Individual" ? (
                <Target className="h-5 w-5" />
              ) : (
                <Users className="h-5 w-5" />
              )}
              Selected Sports ({selectedSports.length})
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
                  <TableHead>Age Range</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead className="w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSports.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={item.sportType === "Individual" ? "default" : "secondary"}>
                        {item.sportType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.sport}</TableCell>
                    <TableCell>{item.category || "-"}</TableCell>
                    <TableCell>{item.subCategory || "-"}</TableCell>
                    <TableCell>{item.ageFrom} - {item.ageTo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.gender}</Badge>
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
