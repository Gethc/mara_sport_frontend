import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Plus, Trash2, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface SportsSubCategoriesStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

// Constants for age categories and gender options
const AGE_CATEGORIES = ["U9", "U11", "U13", "U15", "U17", "U19"];
const GENDER_OPTIONS = ["Open", "Male", "Female", "Mixed"];
const SPORT_TYPES = ["Individual", "Team"];

// Interface for selected sport
interface SelectedSport {
  sportType: string;
  sport: string; 
  category: string;
  subCategory: string;
  ageFrom: string;
  ageTo: string;
  gender: string;
  sportId: number;
  categoryId?: number;
  subCategoryId?: number;
}

export const SportsSubCategoriesStep = ({ initialData, onComplete, onBack }: SportsSubCategoriesStepProps) => {
  const { toast } = useToast();
  const [selectedSports, setSelectedSports] = useState<SelectedSport[]>(initialData?.selectedSports || []);
  
  const [currentSportType, setCurrentSportType] = useState("Individual");
  const [currentSport, setCurrentSport] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSubCategory, setCurrentSubCategory] = useState("");
  const [currentAgeFrom, setCurrentAgeFrom] = useState("");
  const [currentAgeTo, setCurrentAgeTo] = useState("");
  const [currentGender, setCurrentGender] = useState("other");
  const [errors, setErrors] = useState<string[]>([]);
  
  // State for API data
  const [sports, setSports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sports data from API
  useEffect(() => {
    const fetchSports = async () => {
      console.log("🔄 Loading sports data...");
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

  const addSport = () => {
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
    const duplicate = selectedSports.find(
      item => item.sportId === selectedSportData?.id && 
              item.categoryId === selectedCategoryData?.id && 
              item.subCategoryId === selectedSubCategoryData?.id &&
              item.ageFrom === currentAgeFrom &&
              item.ageTo === currentAgeTo &&
              item.gender === currentGender
    );
    if (duplicate) newErrors.push("This sport combination is already added");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const newSport: SelectedSport = {
      sportType: currentSportType,
      sport: currentSport,
      category: currentCategory || "",
      subCategory: currentSubCategory || "",
      ageFrom: currentAgeFrom,
      ageTo: currentAgeTo,
      gender: currentGender,
      sportId: selectedSportData?.id || 0,
      categoryId: selectedCategoryData?.id,
      subCategoryId: selectedSubCategoryData?.id
    };

    setSelectedSports(prev => [...prev, newSport]);
    
    // Reset form
    setCurrentSport("");
    setCurrentCategory("");
    setCurrentSubCategory("");
    setCurrentAgeFrom("");
    setCurrentAgeTo("");
    setCurrentGender("Open");
    setErrors([]);
    
    toast({
      title: "Sport Added Successfully",
      description: `${currentSport} has been added to your selection.`,
    });
  };

  const removeSport = (index: number) => {
    const sportToRemove = selectedSports[index];
    setSelectedSports(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Sport Removed",
      description: `${sportToRemove.sport} has been removed from your selection.`,
    });
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (selectedSports.length === 0) {
      newErrors.push("Please add at least one sport and sub-category");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({ selectedSports });
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
            <Trophy className="h-5 w-5" />
            Add Sports & Sub-Categories
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
                // Reset categories and sub-categories when sport type changes
                setCategories([]);
                setSubCategories([]);
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
                {loading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading sports...
                    </div>
                  </SelectItem>
                ) : error ? (
                  <SelectItem value="error" disabled>
                    Error loading sports
                  </SelectItem>
                ) : (
                  availableSports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.name}>
                      {sport.name}
                    </SelectItem>
                  ))
                )}
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
                  {AGE_CATEGORIES.map((age) => (
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
                  {AGE_CATEGORIES.map((age) => (
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
                    {availableCategories.map((category: any) => (
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
                    {availableSubCategories.map((subCategory: any) => (
                      <SelectItem key={subCategory.id} value={subCategory.name}>
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
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedSports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Sports & Sub-Categories</CardTitle>
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
                    <TableCell className="font-medium">{item.sportType}</TableCell>
                    <TableCell className="font-medium">{item.sport}</TableCell>
                    <TableCell>{item.category || "-"}</TableCell>
                    <TableCell>{item.subCategory || "-"}</TableCell>
                    <TableCell>{item.ageFrom} - {item.ageTo}</TableCell>
                    <TableCell>{item.gender}</TableCell>
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};