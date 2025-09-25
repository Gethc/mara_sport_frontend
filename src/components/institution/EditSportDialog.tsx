import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface EditSportDialogProps {
  sport: {
    id: string;
    name: string;
    type: string;
    sportType: string;
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
  };
  onClose: () => void;
  onSave: () => void;
}

const EditSportDialog = ({ sport, onClose, onSave }: EditSportDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [editForm, setEditForm] = useState({
    name: sport.name,
    type: sport.type,
    sportType: sport.sportType,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
  });

  const [newSubCategory, setNewSubCategory] = useState({
    parentCategory: "",
    name: "",
    gender: "Open",
    level: 1,
  });

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<string | null>(null);

  const sportTypes = ["Individual", "Team"];
  const genderOptions = ["Open", "Male", "Female"];

  const handleSave = async () => {
    try {
      setLoading(true);
      setErrors([]);

      // Validate required fields
      if (!editForm.name.trim()) {
        setErrors(["Sport name is required"]);
        return;
      }

      // Update sport basic info
      await apiService.updateSport(sport.id, {
        name: editForm.name,
        type: editForm.type,
        sportType: editForm.sportType,
      });

      toast({
        title: "Success",
        description: "Sport updated successfully",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating sport:", error);
      toast({
        title: "Error",
        description: "Failed to update sport",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) return;

      setLoading(true);
      await apiService.addSportCategory(sport.id, {
        name: newCategory.name,
      });

      setNewCategory({ name: "" });
      onSave();
      
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubCategory = async () => {
    try {
      if (!newSubCategory.parentCategory || !newSubCategory.name.trim()) return;

      setLoading(true);
      await apiService.addSportSubCategory(newSubCategory.parentCategory, {
        name: newSubCategory.name,
        gender: newSubCategory.gender,
        level: newSubCategory.level,
      });

      setNewSubCategory({
        parentCategory: "",
        name: "",
        gender: "Open",
        level: 1,
      });
      onSave();
      
      toast({
        title: "Success",
        description: "Sub-category added successfully",
      });
    } catch (error) {
      console.error("Error adding sub-category:", error);
      toast({
        title: "Error",
        description: "Failed to add sub-category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      await apiService.deleteSportCategory(categoryId);
      onSave();
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    try {
      setLoading(true);
      await apiService.deleteSportSubCategory(subCategoryId);
      onSave();
      
      toast({
        title: "Success",
        description: "Sub-category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting sub-category:", error);
      toast({
        title: "Error",
        description: "Failed to delete sub-category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Edit Sport: {sport.name}</DialogTitle>
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
          {/* Basic Sport Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sportName">Sport Name *</Label>
                <Input
                  id="sportName"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter sport name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sportType">Sport Type *</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                >
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
            </div>
          </div>

          {/* Categories Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories Management</h3>
            
            {/* Add New Category */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium mb-3">Add New Category</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  className="flex-1"
                />
                <Button onClick={handleAddCategory} disabled={loading || !newCategory.name.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
            </div>

            {/* Existing Categories */}
            <div className="space-y-3">
              {sport.categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium">{category.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(editingCategory === category.id ? null : category.id)}
                      >
                        {editingCategory === category.id ? "Cancel" : "Edit"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Sub-Categories */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-muted-foreground">
                        Sub-Categories ({category.subCategories.length})
                      </h5>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewSubCategory({ ...newSubCategory, parentCategory: category.id })}
                      >
                        Add Sub-Category
                      </Button>
                    </div>

                    {/* Add Sub-Category Form */}
                    {newSubCategory.parentCategory === category.id && (
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Input
                            placeholder="Sub-category name"
                            value={newSubCategory.name}
                            onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                          />
                          <Select
                            value={newSubCategory.gender}
                            onValueChange={(value) => setNewSubCategory({ ...newSubCategory, gender: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {genderOptions.map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Level"
                            value={newSubCategory.level}
                            onChange={(e) => setNewSubCategory({ ...newSubCategory, level: parseInt(e.target.value) || 1 })}
                            min="1"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={handleAddSubCategory}
                              disabled={loading || !newSubCategory.name.trim()}
                            >
                              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setNewSubCategory({ parentCategory: "", name: "", gender: "Open", level: 1 })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Existing Sub-Categories */}
                    <div className="space-y-2">
                      {category.subCategories.map((subCategory) => (
                        <div key={subCategory.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{subCategory.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({subCategory.gender}, Level {subCategory.level})
                            </span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSubCategory(subCategory.id)}
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSportDialog;
