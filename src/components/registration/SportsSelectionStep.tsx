import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Users, Target, Plus, X, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface SportsSelectionStepProps {
  initialData?: any;
  email?: string;
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface Sport {
  id: number;
  name: string;
  type: string;
  age_from: string | number;  // API returns as string
  age_to: string | number;    // API returns as string
  gender: number;
  fee: number;
  min_limit: number;
  max_limit: number;
}

interface Category {
  id: number;
  name: string;
  sport_id: number;
  fee: number;
}

interface SubCategory {
  id: number;
  name: string;
  sport_id: number;
  category_id: number;
}

interface GenderOption {
  value: string;
  label: string;
}

interface SelectedSport {
  sport_id: number;
  sport_name: string;
  category_id?: number;
  category_name?: string;
  sub_category_id?: number;
  sub_category_name?: string;
  ageFrom: string;
  ageTo: string;
  gender: string;
  gender_label: string;
  type: string;
}

export const SportsSelectionStep = ({ initialData, email, onComplete, onBack }: SportsSelectionStepProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    participationType: initialData?.participationType || "",
    selectedSports: initialData?.selectedSports || [] as SelectedSport[],
  });

  const [currentSport, setCurrentSport] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSubCategory, setCurrentSubCategory] = useState("");
  const [currentAgeFrom, setCurrentAgeFrom] = useState("");
  const [currentAgeTo, setCurrentAgeTo] = useState("");
  const [currentGender, setCurrentGender] = useState("Male"); // Default to Male
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [sports, setSports] = useState<Sport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [genderOptions, setGenderOptions] = useState<GenderOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [feeCalculation, setFeeCalculation] = useState<any>(null);
  const [parentPassPricing, setParentPassPricing] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadParentPassPricing();
  }, []);

  const loadParentPassPricing = async () => {
    try {
      const response = await apiService.getPricingSummary();
      const data = response.data as any;
      if (data && data.success) {
        setParentPassPricing(data.data);
      }
    } catch (error) {
      console.error("Error loading parent pass pricing:", error);
      // Fallback to default pricing if API fails
      setParentPassPricing({
        13: [{ amount: 300, pass_type: "Early Bird" }], // Under 13
        14: [{ amount: 500, pass_type: "Early Bird" }]  // 13+
      });
    }
  };

  // Load sports when participation type changes
  useEffect(() => {
    if (formData.participationType) {
      loadSports();
    }
  }, [formData.participationType]);

  // Load categories when sport changes
  useEffect(() => {
    if (currentSport && formData.participationType === "individual") {
      loadCategories();
    } else {
      setCategories([]);
      setSubCategories([]);
    }
  }, [currentSport, formData.participationType]);

  // Load sub-categories when category changes
  useEffect(() => {
    if (currentCategory && currentSport && formData.participationType === "individual") {
      loadSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [currentCategory, currentSport, formData.participationType]);

  // Calculate fees when sports selection changes
  useEffect(() => {
    if (formData.selectedSports.length > 0) {
      calculateFees();
    } else {
      setFeeCalculation(null);
    }
  }, [formData.selectedSports]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [genderResponse] = await Promise.all([
        apiService.getGenderOptions()
      ]);
      
      if (genderResponse.data && (genderResponse.data as any).success) {
        setGenderOptions((genderResponse.data as any).data);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load initial data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadSports = async () => {
    try {
      const sportType = formData.participationType === "team" ? "Team" : "Individual";
      const response = await apiService.getSportsPublic(sportType);
      
      if (response.data && (response.data as any).success) {
        const sportsData = (response.data as any).data;
        console.log("Sports data received:", sportsData);
        
        // Handle both direct array and nested sports array
        if (Array.isArray(sportsData)) {
          setSports(sportsData);
          console.log("Set sports array with", sportsData.length, "items");
        } else if (sportsData && Array.isArray(sportsData.sports)) {
          setSports(sportsData.sports);
          console.log("Set sports from nested array with", sportsData.sports.length, "items");
        } else {
          console.error("Unexpected sports data structure:", sportsData);
          setSports([]);
        }
      } else {
        console.error("Sports API response not successful:", response.data);
        setSports([]);
      }
    } catch (error) {
      console.error("Error loading sports:", error);
      toast({
        title: "Error Loading Sports",
        description: "Failed to load sports data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadCategories = async () => {
    try {
      const selectedSport = sports.find(s => s.id.toString() === currentSport);
      if (selectedSport) {
        const response = await apiService.getSportCategories(selectedSport.id);
        
        if (response.data && (response.data as any).success) {
          setCategories((response.data as any).data);
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error Loading Categories",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadSubCategories = async () => {
    try {
      const selectedSport = sports.find(s => s.id.toString() === currentSport);
      const selectedCategory = categories.find(c => c.id.toString() === currentCategory);
      
      if (selectedSport && selectedCategory) {
        const response = await apiService.getSubCategoriesBySport(selectedSport.id, selectedCategory.id);
        
        if (response.data && (response.data as any).success) {
          setSubCategories((response.data as any).data);
        }
      }
    } catch (error) {
      console.error("Error loading sub-categories:", error);
      toast({
        title: "Error Loading Sub-Categories",
        description: "Failed to load sub-categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateFees = async () => {
    try {
      const calculationData = {
        selectedSports: formData.selectedSports,
        parentCount: 0 // Will be updated when parent data is available
      };

      const response = await apiService.calculateTotalFees(calculationData);
      
      if (response.data && (response.data as any).success) {
        setFeeCalculation((response.data as any).data);
      }
    } catch (error) {
      console.error("Error calculating fees:", error);
      // Don't show error toast for fee calculation as it's not critical
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      participationType: value
      // ✅ Removed selectedSports: [] - Don't clear existing sports!
    }));
    setCurrentSport("");
    setCurrentCategory("");
    setCurrentSubCategory("");
    setCurrentAgeFrom("");
    setCurrentAgeTo("");
    setCurrentGender("Male");
    setErrors([]);
  };

  const addSport = () => {
    if (!currentSport) {
      setErrors(["Please select a sport"]);
      return;
    }

    if (formData.participationType === "individual" && !currentCategory) {
      setErrors(["Please select a category for individual sports"]);
      return;
    }

    if (!currentAgeFrom || !currentAgeTo) {
      setErrors(["Please select age range"]);
      return;
    }

    if (parseInt(currentAgeFrom) > parseInt(currentAgeTo)) {
      setErrors(["Age 'From' must be less than or equal to age 'To'"]);
      return;
    }

    const selectedSport = sports.find(s => s.id.toString() === currentSport);
    const selectedCategory = categories.find(c => c.id.toString() === currentCategory);
    const selectedSubCategory = subCategories.find(sc => sc.id.toString() === currentSubCategory);
    const selectedGender = genderOptions.find(g => g.value === currentGender);

    if (!selectedSport || !selectedGender) {
      setErrors(["Invalid sport or gender selection"]);
      return;
    }

    // Check if sport already exists with same details
    const exists = formData.selectedSports.some(
      item => item.sport_id === selectedSport.id && 
              item.category_id === selectedCategory?.id && 
              item.sub_category_id === selectedSubCategory?.id &&
              item.ageFrom === currentAgeFrom &&
              item.ageTo === currentAgeTo
    );

    if (exists) {
      setErrors(["This sport combination already exists"]);
      return;
    }

    const newSport: SelectedSport = {
      sport_id: selectedSport.id,
      sport_name: selectedSport.name,
      category_id: selectedCategory?.id,
      category_name: selectedCategory?.name,
      sub_category_id: selectedSubCategory?.id,
      sub_category_name: selectedSubCategory?.name,
      ageFrom: currentAgeFrom,
      ageTo: currentAgeTo,
      gender: currentGender,
      gender_label: selectedGender.label,
      type: formData.participationType
    };

    setFormData(prev => ({
      ...prev,
      selectedSports: [...prev.selectedSports, newSport]
    }));

    setCurrentSport("");
    setCurrentCategory("");
    setCurrentSubCategory("");
    setCurrentAgeFrom("");
    setCurrentAgeTo("");
    setCurrentGender("Male");
    setErrors([]);
  };

  const removeSport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSports: prev.selectedSports.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.participationType) newErrors.push("Please select participation type");
    if (formData.selectedSports.length === 0) newErrors.push("Please add at least one sport");
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      // Save sport assignments to database
      const assignmentsData = {
        email: email || initialData?.email,
        selectedSports: formData.selectedSports
      };
      
      const response = await apiService.saveSportAssignments(assignmentsData);
      
      if (response.data && (response.data as any).success) {
        // Save registration progress
        const progressData = {
          email: email || initialData?.email,
          sports_selection: formData,
          current_phase: 4,
          completed_phases: [1, 2, 3, 4],
          is_completed: true
        };
        
        await apiService.saveStudentRegistrationProgress(progressData);
        
        toast({
          title: "Sports Selection Saved! ✅",
          description: "Your sports selection has been saved successfully. Registration complete!",
        });
        
        onComplete(formData);
      } else {
        throw new Error((response.data && (response.data as any).message) || "Failed to save sports selection");
      }
    } catch (error) {
      console.error("Error saving sports selection:", error);
      toast({
        title: "Error Saving Sports Selection",
        description: error instanceof Error ? error.message : "Failed to save sports selection. Please try again.",
        variant: "destructive",
      });
      setErrors(["Failed to save sports selection. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate age options - hardcoded range from 9 to 19
  const generateAgeOptions = () => {
    const options = [];
    for (let age = 9; age <= 19; age++) {
      options.push(age.toString());
    }
    return options;
  };

  if (loadingData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-medium">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading sports data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Sports Selection</CardTitle>
          <CardDescription>
            Choose your participation type and select the sports you want to participate in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Participation Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Select Type</h3>
            </div>
            
            <RadioGroup 
              value={formData.participationType} 
              onValueChange={handleTypeChange}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="flex items-center space-x-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  <span>Team Sports</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="flex items-center space-x-2 cursor-pointer">
                  <Target className="h-4 w-4" />
                  <span>Individual Sports</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sport Selection */}
          {formData.participationType && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Sports</h3>
                <div className="text-sm text-muted-foreground">
                  Currently adding: <span className="font-medium text-primary">
                    {formData.participationType === "team" ? "Team Sports" : "Individual Sports"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                {/* Sport Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Sport *</Label>
                    <Select value={currentSport} onValueChange={(value) => {
                      setCurrentSport(value);
                      setCurrentCategory("");
                      setCurrentSubCategory("");
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(sports) && sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id.toString()}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select value={currentGender} onValueChange={setCurrentGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age From *</Label>
                    <Select value={currentAgeFrom} onValueChange={(value) => {
                      setCurrentAgeFrom(value);
                      // Reset age to if it's less than the new age from
                      if (currentAgeTo && parseInt(value) > parseInt(currentAgeTo)) {
                        setCurrentAgeTo("");
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose age from" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateAgeOptions().map((age) => (
                          <SelectItem key={age} value={age}>
                            {age} years
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Age To *</Label>
                    <Select value={currentAgeTo} onValueChange={setCurrentAgeTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose age to" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateAgeOptions()
                          .filter(age => !currentAgeFrom || parseInt(age) >= parseInt(currentAgeFrom))
                          .map((age) => (
                            <SelectItem key={age} value={age}>
                              {age} years
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category and Sub-Category for Individual Sports */}
                {formData.participationType === "individual" && currentSport && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={currentCategory} onValueChange={(value) => {
                        setCurrentCategory(value);
                        setCurrentSubCategory("");
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose category" />
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
                    
                    <div className="space-y-2">
                      <Label>Sub-Category</Label>
                      <Select value={currentSubCategory} onValueChange={setCurrentSubCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose sub-category" />
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
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    onClick={addSport}
                    disabled={!currentSport || !currentAgeFrom || !currentAgeTo}
                    className="bg-gradient-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sport
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Sports Display */}
          {formData.selectedSports.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selected Sports</h3>
              
              <div className="space-y-3">
                {formData.selectedSports.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-center space-x-3 flex-1">
                      <Trophy className="h-4 w-4 text-accent" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-foreground">{item.sport_name}</div>
                          <Badge variant="secondary" className="text-xs">
                            {item.type === "team" ? "Team" : "Individual"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {item.category_name && <div>Category: {item.category_name}</div>}
                          {item.sub_category_name && <div>Sub-Category: {item.sub_category_name}</div>}
                          <div>Age: {item.ageFrom} - {item.ageTo}</div>
                          <div>Gender: {item.gender_label}</div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSport(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm text-primary font-medium">
                  Registration Fee Summary (KES):
                </div>
                {feeCalculation ? (
                  <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    <div className="flex justify-between">
                      <span>Sports Fee ({formData.selectedSports.length} sports):</span>
                      <span>KES {feeCalculation.breakdown.sports_fees.reduce((sum: number, sport: any) => sum + sport.fee, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium text-primary border-t pt-1">
                      <span>Total:</span>
                      <span>KES {feeCalculation.breakdown.total.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1">
                    Sports Fee: KES {formData.selectedSports.length * 1000} = 
                    <span className="font-medium text-primary ml-1">
                      KES {(formData.selectedSports.length * 1000).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Alert>
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> You can participate in both team and individual sports. Switch between "Team Sports" and "Individual Sports" to add different types - your previously selected sports will be preserved. Each additional sport incurs a $25 registration fee.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};