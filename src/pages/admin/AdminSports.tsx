

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Download, ChevronDown, ChevronRight, Trophy, Users, DollarSign, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { 
  GENDER_OPTIONS, 
  SPORT_TYPES
} from "@/lib/sportsData";

const AdminSports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditSportOpen, setIsEditSportOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<any>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);
  const [isEditSubCategoryOpen, setIsEditSubCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [newSport, setNewSport] = useState({
    sportType: "Individual",
    sportName: "",
    ageFrom: "",
    ageTo: "",
    gender: "other",
    fee: "",
    participantLimit: "",
    minPlayer: "",
    maxPlayer: ""
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [feeRules, setFeeRules] = useState<any[]>([]);
  
  // Note: Fee rules are now supported for both Individual and Team sports
  // No need to clear fee rules when switching sport types
  
  const [newSubCategory, setNewSubCategory] = useState({
    parentSport: "",
    name: ""
  });
  const [editingCategoryData, setEditingCategoryData] = useState({
    name: "",
    subcategories: [] as any[]
  });
  const [deletedSubcategories, setDeletedSubcategories] = useState<any[]>([]);
  
  // State for API data
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSports, setTotalSports] = useState(0);
  const [sportsPerPage] = useState(10);

  // Fetch sports data
  const fetchSports = async (page: number = currentPage) => {
    try {
      console.log('🔄 Fetching sports...');
      const skip = (page - 1) * sportsPerPage;
      const response = await apiService.getAdminSports({
        skip: skip,
        limit: sportsPerPage
      });
      console.log('📡 API Response:', response);
      console.log('📡 Response data:', response.data);
      
      // Backend returns { success: true, data: { sports: [...] } }
      const responseData = response.data as any;
      const sportsData = responseData?.data?.sports || responseData?.sports || [];
      console.log('🏆 Sports data:', sportsData);
      console.log('🏆 Sports data type:', typeof sportsData);
      console.log('🏆 Is array:', Array.isArray(sportsData));
      
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setTotalSports(responseData?.data?.total || 0);
      console.log('✅ Sports set successfully');
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

  useEffect(() => {
    fetchSports();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSports(page);
  };

  // Debug effect to log render state
  useEffect(() => {
    console.log('🎭 Render - Sports length:', sports.length);
    console.log('🎭 Render - Sports:', sports);
    console.log('🎭 Render - Loading:', loading);
  }, [sports, loading]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddSport = async () => {
    try {
      // Validate required fields
      if (!newSport.sportType) {
        toast({
          title: "Validation Error",
          description: "Sport type is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.sportName.trim()) {
        toast({
          title: "Validation Error",
          description: "Sport name is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.ageFrom || !newSport.ageTo) {
        toast({
          title: "Validation Error",
          description: "Age from and age to are required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.gender) {
        toast({
          title: "Validation Error",
          description: "Gender is required",
          variant: "destructive",
        });
        return;
      }


      // Validate categories
      const validCategories = categories.filter(cat => cat.name.trim());
      for (const category of validCategories) {
        if (!category.name.trim()) {
          toast({
            title: "Validation Error",
            description: "Category name is required",
            variant: "destructive",
          });
          return;
        }

        // Validate sub-categories within this category
        const validSubCategories = (category.subcategories || []).filter(sub => sub.name.trim());
        for (const subCat of validSubCategories) {
          if (!subCat.name.trim()) {
            toast({
              title: "Validation Error",
              description: "Sub-category name is required",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Prepare sport data
      const sportData = {
        sport_name: newSport.sportName,
        type: newSport.sportType,
        age_from: newSport.ageFrom,
        age_to: newSport.ageTo,
        gender: newSport.gender,
        min_limit: newSport.participantLimit ? parseInt(newSport.participantLimit) : null,
        max_limit: newSport.participantLimit ? parseInt(newSport.participantLimit) : null,
        categories: validCategories.map(category => ({
          name: category.name,
          subcategories: (category.subcategories || []).filter(sub => sub.name.trim()).map(sub => ({
            name: sub.name
          }))
        }))
      };

      // Create sport via API
      const response = await apiService.createSport(sportData);
      
      // Create fee rules for both Individual and Team sports
      if (response.data && response.data.success) {
        const sportId = response.data.data.id;
        
        // Create fee rule from the fee field if provided
        if (newSport.fee && parseFloat(newSport.fee) >= 0) {
          await apiService.createFeeRule(sportId.toString(), {
            discipline_count: 1,
            fee: parseFloat(newSport.fee)
          });
        }
        
        // Create additional fee rules for Individual sports
        if (newSport.sportType === "Individual") {
          for (const rule of feeRules) {
            await apiService.createFeeRule(sportId.toString(), {
              discipline_count: rule.discipline_count,
              fee: rule.fee
            });
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Sport created successfully!",
      });
      
      setIsAddFormOpen(false);
      setNewSport({ 
        sportType: "Individual",
        sportName: "",
        ageFrom: "",
        ageTo: "",
        gender: "other",
        fee: "",
        participantLimit: "",
        minPlayer: "",
        maxPlayer: ""
      });
      setCategories([]);
      setSubCategories([]);
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error creating sport:', error);
      toast({
        title: "Error",
        description: "Failed to create sport",
        variant: "destructive",
      });
    }
  };

  const handleEditSport = async (sport: any) => {
    try {
      setEditingSport(sport);
      
      // Set basic sport data
      setNewSport({
        sportType: sport.type || "Individual",
        sportName: sport.name || sport.sport_name || "",
        ageFrom: sport.age_from || sport.ageFrom || "",
        ageTo: sport.age_to || sport.ageTo || "",
        gender: sport.gender || "other",
        fee: sport.fee_rules && sport.fee_rules.length > 0 ? sport.fee_rules[0].fee.toString() : (sport.fee ? sport.fee.toString() : ""),
        participantLimit: sport.type === "Individual" && sport.min_limit && sport.max_limit ? `${sport.min_limit}-${sport.max_limit}` : "",
        minPlayer: sport.type === "Team" ? (sport.min_limit || "") : "",
        maxPlayer: sport.type === "Team" ? (sport.max_limit || "") : ""
      });
      
      // Use categories and subcategories that are already loaded from the database
      // The sport object already contains the complete data structure from /admin/sports
      if (sport.categories && Array.isArray(sport.categories)) {
        console.log('🏆 Using existing categories data:', sport.categories);
        setCategories(sport.categories);
      } else {
        console.log('⚠️ No categories found in sport data, setting empty array');
        setCategories([]);
      }
      
      // Fee rules are already included in the sport data from /admin/sports
      if (sport.fee_rules && Array.isArray(sport.fee_rules)) {
        console.log('💰 Using existing fee rules data:', sport.fee_rules);
        setFeeRules(sport.fee_rules);
      } else {
        console.log('⚠️ No fee rules found in sport data, setting empty array');
        setFeeRules([]);
      }
      
      setSubCategories([]);
      setIsEditSportOpen(true);
    } catch (error) {
      console.error('Error loading sport data for editing:', error);
      toast({
        title: "Error",
        description: "Failed to load sport data for editing",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSport = async () => {
    try {
      // Validate required fields
      if (!newSport.sportType) {
        toast({
          title: "Validation Error",
          description: "Sport type is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.sportName) {
        toast({
          title: "Validation Error",
          description: "Sport name is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.ageFrom || !newSport.ageTo) {
        toast({
          title: "Validation Error",
          description: "Age from and age to are required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.gender) {
        toast({
          title: "Validation Error",
          description: "Gender is required",
          variant: "destructive",
        });
        return;
      }


      // Validate categories
      const validCategories = categories.filter(cat => cat.name.trim());
      for (const category of validCategories) {
        if (!category.name.trim()) {
          toast({
            title: "Validation Error",
            description: "Category name is required",
            variant: "destructive",
          });
          return;
        }

        // Validate sub-categories for this category
        const validSubCategories = (category.subcategories || []).filter(sub => sub.name.trim());
        for (const subCat of validSubCategories) {
          if (!subCat.name.trim()) {
            toast({
              title: "Validation Error",
              description: "Sub-category name is required",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Parse participant limit based on sport type
      let minLimit = null;
      let maxLimit = null;
      
      if (newSport.sportType === "Team") {
        // For team sports, use min/max player fields
        minLimit = newSport.minPlayer ? parseInt(newSport.minPlayer) : null;
        maxLimit = newSport.maxPlayer ? parseInt(newSport.maxPlayer) : null;
      } else {
        // For individual sports, use the general participant limit
        if (newSport.participantLimit.trim()) {
          const parts = newSport.participantLimit.split('-');
          if (parts.length === 2) {
            minLimit = parseInt(parts[0].trim());
            maxLimit = parseInt(parts[1].trim());
          }
        }
      }

      // Prepare sport data
      const sportData = {
        sport_name: newSport.sportName.trim(),
        type: newSport.sportType,
        age_from: newSport.ageFrom.trim(),
        age_to: newSport.ageTo.trim(),
        gender: newSport.gender,
        min_limit: minLimit,
        max_limit: maxLimit,
        is_active: true
      };

      // Update sport via API
      await apiService.updateSport(parseInt(editingSport.id), sportData);
      
      // Update fee rules for both Individual and Team sports
      if (newSport.fee && parseFloat(newSport.fee) >= 0) {
        try {
          if (feeRules.length > 0 && feeRules[0].id) {
            // Update the first fee rule with the new fee
            await apiService.updateFeeRule(feeRules[0].id.toString(), {
              discipline_count: feeRules[0].discipline_count,
              fee: parseFloat(newSport.fee)
            });
          } else {
            // Create a new fee rule with the fee
            await apiService.createFeeRule(editingSport.id.toString(), {
              discipline_count: 1,
              fee: parseFloat(newSport.fee)
            });
          }
        } catch (error) {
          console.log('Fee rule update/create error:', error);
          // If creating fails because it already exists, try to update instead
          if (error.message && error.message.includes('already exists')) {
            // Try to get existing fee rules and update the first one
            const existingRules = await apiService.getSportFeeRules(editingSport.id.toString());
            if (existingRules.data && existingRules.data.length > 0) {
              await apiService.updateFeeRule(existingRules.data[0].id.toString(), {
                discipline_count: existingRules.data[0].discipline_count,
                fee: parseFloat(newSport.fee)
              });
            }
          }
        }
      }
      
      // Update other fee rules (only for Individual sports)
      if (newSport.sportType === "Individual") {
        for (const rule of feeRules.slice(1)) {
          if (rule.id) {
            // Update existing fee rule
            await apiService.updateFeeRule(rule.id.toString(), {
              discipline_count: rule.discipline_count,
              fee: rule.fee
            });
          } else {
            // Create new fee rule
            await apiService.createFeeRule(editingSport.id.toString(), {
              discipline_count: rule.discipline_count,
              fee: rule.fee
            });
          }
        }
      }

      // Update categories and subcategories
      for (const category of validCategories) {
        if (category.id) {
        // Update existing category
        await apiService.updateCategory(category.id.toString(), {
          name: category.name.trim(),
          is_active: category.is_active !== false
        });
      } else {
        // Create new category
        const categoryResponse = await apiService.addSportCategory(editingSport.id.toString(), {
          name: category.name.trim(),
          fee: 0.00  // Default fee for new categories
        });
        
        // Update the category object with the new ID from the response
        if (categoryResponse.data && categoryResponse.data.success) {
          category.id = categoryResponse.data.data.id;
        }
      }
        
        // Update subcategories for this category
        const validSubCategories = (category.subcategories || []).filter(sub => sub.name.trim());
        for (const subcategory of validSubCategories) {
          if (subcategory.id) {
            // Update existing subcategory
            await apiService.updateSubCategory(subcategory.id.toString(), {
              name: subcategory.name.trim(),
              is_active: subcategory.is_active !== false
            });
          } else {
            // Create new subcategory
            await apiService.addSportSubCategory(category.id.toString(), {
              name: subcategory.name.trim()
            });
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Sport updated successfully!",
      });
      
      setIsEditSportOpen(false);
      setEditingSport(null);
      setNewSport({ 
        sportType: "Individual",
        sportName: "",
        ageFrom: "",
        ageTo: "",
        gender: "other",
        fee: "",
        participantLimit: "",
        minPlayer: "",
        maxPlayer: ""
      });
      setCategories([]);
      setSubCategories([]);
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error updating sport:', error);
      toast({
        title: "Error",
        description: "Failed to update sport",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSport = async (sportId: string) => {
    try {
      // Delete sport via API
      await apiService.deleteSport(parseInt(sportId));
      
      toast({
        title: "Success",
        description: "Sport deleted successfully!",
      });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error deleting sport:', error);
      toast({
        title: "Error",
        description: "Failed to delete sport",
        variant: "destructive",
      });
    }
  };

  const handleAddSubCategory = async (sportId: string) => {
    try {
      // Validate subcategory data
      if (!newSubCategory.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Sub-category name is required",
          variant: "destructive",
        });
        return;
      }

      // Add subcategory via API
      await apiService.addSubCategory(sportId, {
        name: newSubCategory.name.trim()
      });
      
      toast({
        title: "Success",
        description: "Sub-category added successfully!",
      });
      
      setNewSubCategory({ parentSport: "", name: "" });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to add sub-category",
        variant: "destructive",
      });
    }
  };

  const handleEditSubCategory = (subCategory: any) => {
    setEditingSubCategory(subCategory);
    setNewSubCategory({
      parentSport: subCategory.sportId || "",
      name: subCategory.name || ""
    });
    setIsEditSubCategoryOpen(true);
  };

  const handleEditCategory = (category: any) => {
    console.log('🏆 Editing category:', category);
    setEditingCategory(category);
    setEditingCategoryData({
      name: category.name || "",
      subcategories: category.subcategories || []
    });
    setDeletedSubcategories([]); // Reset deleted subcategories
    setIsEditCategoryOpen(true);
  };

  const handleUpdateCategory = async () => {
    try {
      // Validate category data
      if (!editingCategoryData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Category name is required",
          variant: "destructive",
        });
        return;
      }

      // Update category name
      await apiService.updateCategory(parseInt(editingCategory.id), {
        name: editingCategoryData.name.trim(),
        is_active: editingCategory.is_active !== false
      });

      // Delete subcategories that were marked for deletion
      for (const deletedSubcategory of deletedSubcategories) {
        if (deletedSubcategory.id) {
          console.log('🗑️ Deleting subcategory:', deletedSubcategory);
          await apiService.deleteSportSubCategory(deletedSubcategory.id.toString());
        }
      }

      // Update subcategories
      for (const subcategory of editingCategoryData.subcategories) {
        if (subcategory.name.trim()) {
          if (subcategory.id) {
            // Update existing subcategory
            await apiService.updateSubCategory(parseInt(subcategory.id), {
              name: subcategory.name.trim(),
              is_active: subcategory.is_active !== false
            });
          } else {
            // Create new subcategory
            await apiService.addSportSubCategory(editingCategory.id.toString(), {
              name: subcategory.name.trim()
            });
          }
        }
      }

      toast({
        title: "Success",
        description: "Category updated successfully!",
      });

      setIsEditCategoryOpen(false);
      setEditingCategory(null);
      setEditingCategoryData({ name: "", subcategories: [] });
      setDeletedSubcategories([]);

      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubCategory = async () => {
    try {
      // Validate subcategory data
      if (!newSubCategory.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Sub-category name is required",
          variant: "destructive",
        });
        return;
      }

      // Check if editingSubCategory has a valid ID
      if (!editingSubCategory || !editingSubCategory.id) {
        toast({
          title: "Error",
          description: "Invalid subcategory data. Please try refreshing the page.",
          variant: "destructive",
        });
        return;
      }

      console.log('Updating subcategory:', {
        id: editingSubCategory.id,
        name: newSubCategory.name.trim(),
        subcategoryData: editingSubCategory
      });

      // Update subcategory via API
      await apiService.updateSubCategory(parseInt(editingSubCategory.id), {
        name: newSubCategory.name.trim()
      });
      
      toast({
        title: "Success",
        description: "Sub-category updated successfully!",
      });
      
      setIsEditSubCategoryOpen(false);
      setEditingSubCategory(null);
      setNewSubCategory({ parentSport: "", name: "" });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error updating subcategory:', error);
      console.error('Editing subcategory data:', editingSubCategory);
      toast({
        title: "Error",
        description: `Failed to update sub-category. The subcategory may have been deleted or doesn't exist. Please refresh the page and try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Delete category via API
      await apiService.deleteSportCategory(categoryId);
      
      toast({
        title: "Success",
        description: "Category deleted successfully!",
      });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    try {
      // Delete subcategory via API
      await apiService.deleteSubCategory(subCategoryId);
      
      toast({
        title: "Success",
        description: "Sub-category deleted successfully!",
      });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete sub-category",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    // TODO: Implement export functionality
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be implemented soon.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Sports Management</h1>
          <p className="text-muted-foreground">Manage sports categories and subcategories</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportData} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Sport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Sport</DialogTitle>
                <DialogDescription>
                  Create a new sport with age groups, categories, and sub-categories.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Sport Type Selection */}
                <div>
                  <Label htmlFor="sportType">Sport Type *</Label>
                  <Select 
                    value={newSport.sportType} 
                    onValueChange={(value) => {
                      setNewSport({
                        ...newSport, 
                        sportType: value,
                        sportName: "",
                        ageFrom: "",
                        ageTo: ""
                      });
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

                {/* Sport Name - Manual Input */}
                <div>
                  <Label htmlFor="sportName">Sport Name *</Label>
                  <Input
                    id="sportName"
                    value={newSport.sportName}
                    onChange={(e) => setNewSport({...newSport, sportName: e.target.value})}
                    placeholder="e.g., Football, Athletics, Swimming"
                  />
                </div>

                {/* Age Group Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ageFrom">Age From *</Label>
                    <Input
                      id="ageFrom"
                      value={newSport.ageFrom}
                      onChange={(e) => setNewSport({...newSport, ageFrom: e.target.value})}
                      placeholder="e.g., U9, U11, 12, 15"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ageTo">Age To *</Label>
                    <Input
                      id="ageTo"
                      value={newSport.ageTo}
                      onChange={(e) => setNewSport({...newSport, ageTo: e.target.value})}
                      placeholder="e.g., U19, U17, 18, 21"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={newSport.gender} 
                    onValueChange={(value) => setNewSport({...newSport, gender: value})}
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

                {/* Participant Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  {newSport.sportType === "Individual" ? (
                    <div>
                      <Label htmlFor="participantLimit">Participant Limit</Label>
                      <Input
                        id="participantLimit"
                        type="number"
                        value={newSport.participantLimit}
                        onChange={(e) => setNewSport({...newSport, participantLimit: e.target.value})}
                        placeholder="e.g., 50, 100, 200"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="participantLimit">Team Size Range</Label>
                      <div className="flex gap-2">
                        <Input
                          id="minPlayer"
                          type="number"
                          value={newSport.minPlayer}
                          onChange={(e) => setNewSport({...newSport, minPlayer: e.target.value})}
                          placeholder="Min players"
                        />
                        <span className="flex items-center text-muted-foreground">to</span>
                        <Input
                          id="maxPlayer"
                          type="number"
                          value={newSport.maxPlayer}
                          onChange={(e) => setNewSport({...newSport, maxPlayer: e.target.value})}
                          placeholder="Max players"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Fee Field */}
                <div>
                  <Label htmlFor="fee">Fee (KSh)</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={newSport.fee || ""}
                    onChange={(e) => setNewSport({...newSport, fee: e.target.value})}
                    placeholder="e.g., 500, 1000, 1500"
                  />
                </div>

                {/* Categories Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Categories</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCategory = {
                          name: "",
                          subcategories: []
                        };
                        setCategories([...categories, newCategory]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                  
                  {categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Category {categoryIndex + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCategories(categories.filter((_, i) => i !== categoryIndex))}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Category Name *</Label>
                          <Input
                            placeholder="e.g., Track, Field, 1v1, Doubles"
                            value={category.name}
                            onChange={(e) => {
                              const updated = [...categories];
                              updated[categoryIndex].name = e.target.value;
                              setCategories(updated);
                            }}
                          />
                        </div>
                      </div>
                      

                      {/* Sub-Categories for this Category */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Sub-Categories</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSubCategory = {
                                name: "",
                                ageFrom: "",
                                ageTo: ""
                              };
                              const updated = [...categories];
                              updated[categoryIndex].subcategories = [...(updated[categoryIndex].subcategories || []), newSubCategory];
                              setCategories(updated);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Sub-Category
                          </Button>
                        </div>
                        
                        {(category.subcategories || []).map((subCat, subIndex) => (
                          <div key={subIndex} className="p-3 border rounded-lg space-y-3 bg-background">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium">Sub-Category {subIndex + 1}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = [...categories];
                                  updated[categoryIndex].subcategories = updated[categoryIndex].subcategories.filter((_, i) => i !== subIndex);
                                  setCategories(updated);
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div>
                              <Label className="text-xs text-muted-foreground">Sub-Category Name *</Label>
                              <Input
                                placeholder="e.g., 50m, 100m, Doubles"
                                value={subCat.name}
                                onChange={(e) => {
                                  const updated = [...categories];
                                  updated[categoryIndex].subcategories[subIndex].name = e.target.value;
                                  setCategories(updated);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setIsAddFormOpen(false);
                    setNewSport({ 
                      sportType: "Individual",
                      sportName: "",
                      ageFrom: "",
                      ageTo: "",
                      gender: "other",
                      participantLimit: "",
        minPlayer: "",
        maxPlayer: ""
                    });
                    setCategories([]);
                    setSubCategories([]);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSport}>
                    Save Sport
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Sport Dialog */}
      <Dialog open={isEditSportOpen} onOpenChange={setIsEditSportOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sport</DialogTitle>
            <DialogDescription>
              Update sport information, categories, and sub-categories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Sport Type Selection */}
            <div>
              <Label htmlFor="editSportType">Sport Type *</Label>
              <Select 
                value={newSport.sportType} 
                onValueChange={(value) => setNewSport({...newSport, sportType: value})}
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

            {/* Sport Name */}
            <div>
              <Label htmlFor="editSportName">Sport Name *</Label>
              <Input
                id="editSportName"
                value={newSport.sportName}
                onChange={(e) => setNewSport({...newSport, sportName: e.target.value})}
                placeholder="e.g., Football, Basketball, Swimming, Badminton"
              />
            </div>

            {/* Age Group Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editAgeFrom">Age From *</Label>
                <Input
                  id="editAgeFrom"
                  value={newSport.ageFrom}
                  onChange={(e) => setNewSport({...newSport, ageFrom: e.target.value})}
                  placeholder="e.g., U9, U11, 12, 15"
                />
              </div>
              <div>
                <Label htmlFor="editAgeTo">Age To *</Label>
                <Input
                  id="editAgeTo"
                  value={newSport.ageTo}
                  onChange={(e) => setNewSport({...newSport, ageTo: e.target.value})}
                  placeholder="e.g., U19, U17, 18, 21"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="editGender">Gender *</Label>
              <Select 
                value={newSport.gender} 
                onValueChange={(value) => setNewSport({...newSport, gender: value})}
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

            {/* Participant Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              {newSport.sportType === "Individual" ? (
                <div>
                  <Label htmlFor="editParticipantLimit">Participant Limit</Label>
                  <Input
                    id="editParticipantLimit"
                    type="number"
                    value={newSport.participantLimit}
                    onChange={(e) => setNewSport({...newSport, participantLimit: e.target.value})}
                    placeholder="e.g., 50, 100, 200"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="editParticipantLimit">Team Size Range</Label>
                  <div className="flex gap-2">
                    <Input
                      id="editMinPlayer"
                      type="number"
                      value={newSport.minPlayer}
                      onChange={(e) => setNewSport({...newSport, minPlayer: e.target.value})}
                      placeholder="Min players"
                    />
                    <span className="flex items-center text-muted-foreground">to</span>
                    <Input
                      id="editMaxPlayer"
                      type="number"
                      value={newSport.maxPlayer}
                      onChange={(e) => setNewSport({...newSport, maxPlayer: e.target.value})}
                      placeholder="Max players"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fee Field - Available for both Individual and Team Sports */}
            <div>
              <Label htmlFor="editFee">Fee (KSh)</Label>
              <Input
                id="editFee"
                type="number"
                value={newSport.fee || ""}
                onChange={(e) => setNewSport({...newSport, fee: e.target.value})}
                placeholder="e.g., 500, 1000, 1500"
              />
            </div>

            {/* Fee Rules Section - Only for Individual Sports */}
            {newSport.sportType === "Individual" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Fee Rules</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFeeRule = {
                        discipline_count: 1,
                        fee: 0
                      };
                      setFeeRules([...feeRules, newFeeRule]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fee Rule
                  </Button>
                </div>
                
                {feeRules.map((rule, ruleIndex) => (
                  <div key={ruleIndex} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Fee Rule {ruleIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFeeRules(feeRules.filter((_, i) => i !== ruleIndex))}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Discipline Count *</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 1, 2, 3"
                          value={rule.discipline_count || ''}
                          onChange={(e) => {
                            const updated = [...feeRules];
                            updated[ruleIndex].discipline_count = parseInt(e.target.value) || 1;
                            setFeeRules(updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Fee (KSh) *</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 500, 1000"
                          value={rule.fee || ''}
                          onChange={(e) => {
                            const updated = [...feeRules];
                            updated[ruleIndex].fee = parseInt(e.target.value) || 0;
                            setFeeRules(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Categories</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newCategory = {
                      name: "",
                      is_active: true,
                      subcategories: []
                    };
                    setCategories([...categories, newCategory]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              
              {categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Category {categoryIndex + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategories(categories.filter((_, i) => i !== categoryIndex))}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Category Name *</Label>
                      <Input
                        placeholder="e.g., Track, Field, 1v1, Doubles"
                        value={category.name || ''}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[categoryIndex].name = e.target.value;
                          setCategories(updated);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`category-active-${categoryIndex}`}
                      checked={category.is_active !== false}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[categoryIndex].is_active = e.target.checked;
                        setCategories(updated);
                      }}
                    />
                    <Label htmlFor={`category-active-${categoryIndex}`} className="text-xs">
                      Active
                    </Label>
                  </div>

                  {/* Sub-Categories for this Category */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sub-Categories</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSubCategory = {
                            name: "",
                            age_from: "",
                            age_to: "",
                            is_active: true
                          };
                          const updated = [...categories];
                          updated[categoryIndex].subcategories = [...(updated[categoryIndex].subcategories || []), newSubCategory];
                          setCategories(updated);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sub-Category
                      </Button>
                    </div>
                    
                    {(category.subcategories || []).map((subCat, subIndex) => (
                      <div key={subIndex} className="p-3 border rounded-lg space-y-3 bg-background">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Sub-Category {subIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = [...categories];
                              updated[categoryIndex].subcategories = updated[categoryIndex].subcategories.filter((_, i) => i !== subIndex);
                              setCategories(updated);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Sub-Category Name *</Label>
                          <Input
                            placeholder="e.g., 50m, 100m, Doubles"
                            value={subCat.name || ''}
                            onChange={(e) => {
                              const updated = [...categories];
                              updated[categoryIndex].subcategories[subIndex].name = e.target.value;
                              setCategories(updated);
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`subcategory-active-${categoryIndex}-${subIndex}`}
                            checked={subCat.is_active !== false}
                            onChange={(e) => {
                              const updated = [...categories];
                              updated[categoryIndex].subcategories[subIndex].is_active = e.target.checked;
                              setCategories(updated);
                            }}
                          />
                          <Label htmlFor={`subcategory-active-${categoryIndex}-${subIndex}`} className="text-xs">
                            Active
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setIsEditFormOpen(false);
                setEditingSport(null);
                setNewSport({ 
                  sportType: "Individual",
                  sportName: "",
                  ageFrom: "",
                  ageTo: "",
                  gender: "other",
                  participantLimit: "",
        minPlayer: "",
        maxPlayer: ""
                });
                setCategories([]);
                setSubCategories([]);
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSport}>
                Update Sport
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Sub-category Dialog */}
      <Dialog open={isEditSubCategoryOpen} onOpenChange={setIsEditSubCategoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sub-category</DialogTitle>
            <DialogDescription>
              Update sub-category information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editSubCategoryName">Sub-category Name</Label>
              <Input
                id="editSubCategoryName"
                value={newSubCategory.name}
                onChange={(e) => setNewSubCategory({...newSubCategory, name: e.target.value})}
                placeholder="e.g., Under 16 Boys"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditSubCategoryOpen(false);
                setEditingSubCategory(null);
                setNewSubCategory({ parentSport: "", name: "" });
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubCategory}>
                Update Sub-category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information and its sub-categories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Category Name */}
            <div>
              <Label htmlFor="editCategoryName">Category Name *</Label>
              <Input
                id="editCategoryName"
                value={editingCategoryData.name}
                onChange={(e) => setEditingCategoryData({
                  ...editingCategoryData,
                  name: e.target.value
                })}
                placeholder="e.g., Distance, Stroke, Relay"
              />
            </div>

            {/* Subcategories Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-medium">Sub-categories</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSubcategory = {
                      id: null,
                      name: "",
                      is_active: true
                    };
                    setEditingCategoryData({
                      ...editingCategoryData,
                      subcategories: [...editingCategoryData.subcategories, newSubcategory]
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-category
                </Button>
              </div>
              
              {editingCategoryData.subcategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sub-categories available. Click "Add Sub-category" to create one.
                </div>
              ) : (
                <div className="space-y-3">
                  {editingCategoryData.subcategories.map((subcategory, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-3 bg-background">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Sub-category {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const subcategoryToDelete = editingCategoryData.subcategories[index];
                            
                            // If it's an existing subcategory (has an ID), add it to deleted list
                            if (subcategoryToDelete.id) {
                              setDeletedSubcategories(prev => [...prev, subcategoryToDelete]);
                            }
                            
                            // Remove from the current list
                            const updated = [...editingCategoryData.subcategories];
                            updated.splice(index, 1);
                            setEditingCategoryData({
                              ...editingCategoryData,
                              subcategories: updated
                            });
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-muted-foreground">Sub-category Name *</Label>
                        <Input
                          placeholder="e.g., 25m, 50m, 100m, Freestyle"
                          value={subcategory.name}
                          onChange={(e) => {
                            const updated = [...editingCategoryData.subcategories];
                            updated[index].name = e.target.value;
                            setEditingCategoryData({
                              ...editingCategoryData,
                              subcategories: updated
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditCategoryOpen(false);
                setEditingCategory(null);
                setEditingCategoryData({ name: "", subcategories: [] });
                setDeletedSubcategories([]);
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCategory}>
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sports List */}
      <div className="space-y-4">
        {sports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sports found</h3>
              <p className="text-muted-foreground text-center">
                No sports have been configured yet. Add your first sport category to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          (sports || []).map((sport) => (
            <Card key={sport.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg">{sport.name || sport.sport_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {sport.type} Sport | Age: {sport.age_from}-{sport.age_to} | Gender: {sport.gender === 1 ? 'Male' : sport.gender === 0 ? 'Female' : 'Both'}
                        {sport.type === 'Team' && sport.min_limit && sport.max_limit && 
                          ` | Team Size: ${sport.min_limit}-${sport.max_limit}`
                        }
                        {sport.fee_rules && sport.fee_rules.length > 0 && 
                          ` | Fee: KSh ${sport.fee_rules[0].fee}`
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {sport.student_count || 0} students
                    </Badge>
                    <Badge variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {sport.institution_count || 0} institutions
                    </Badge>
                    <Badge variant="outline">
                      {sport.categories?.length || 0} categories
                    </Badge>
                    <Badge variant={sport.is_active ? "default" : "secondary"}>
                      {sport.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSport(sport)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Sport</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{sport.name || sport.sport_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSport(sport.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Categories */}
                  {(!sport.categories || sport.categories.length === 0) ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No categories available
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {sport.categories.map((category: any) => (
                        <Card key={category.id} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <h4 className="font-medium">{category.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Status: {category.is_active ? 'Active' : 'Inactive'}
                                  </p>
                                  {category.subcategories && category.subcategories.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Subcategories: {category.subcategories.map((sub: any) => sub.name).join(', ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {category.subcategories?.length || 0} subcategories
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Pagination */}
        {totalSports > sportsPerPage && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * sportsPerPage) + 1} to {Math.min(currentPage * sportsPerPage, totalSports)} of {totalSports} sports
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(totalSports / sportsPerPage) }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || 
                           page === Math.ceil(totalSports / sportsPerPage) || 
                           Math.abs(page - currentPage) <= 2;
                  })
                  .map((page, index, array) => {
                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && <span className="text-muted-foreground">...</span>}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(totalSports / sportsPerPage)}
              >
                Next
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSports;