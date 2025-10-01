import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Trophy, Users, Target, Edit, Save, X, Plus, Trash2, ArrowLeft, DollarSign, Calendar, Users2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const SportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sport, setSport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [newSubCategory, setNewSubCategory] = useState({
    name: "",
    gender: "Open",
    level: 1
  });
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);

  useEffect(() => {
    const fetchSportDetails = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSport(parseInt(id!));
        const responseData = response.data as any;
        const sportData = responseData?.data || responseData;
        setSport(sportData);
        setEditForm(sportData);
      } catch (error) {
        console.error('Error fetching sport details:', error);
        setError('Failed to load sport details');
        toast({
          title: "Error",
          description: "Failed to load sport details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSportDetails();
    }
  }, [id, toast]);

  const handleUpdateSport = async () => {
    try {
      await apiService.updateSport(parseInt(id!), editForm);
      setSport(editForm);
      setIsEditMode(false);
      toast({
        title: "Success",
        description: "Sport updated successfully",
      });
    } catch (error) {
      console.error('Error updating sport:', error);
      toast({
        title: "Error",
        description: "Failed to update sport",
        variant: "destructive",
      });
    }
  };

  const handleAddSubCategory = async () => {
    try {
      if (!newSubCategory.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Sub-category name is required",
          variant: "destructive",
        });
        return;
      }

      await apiService.addSubCategory(id!, newSubCategory);
      
      // Refresh sport details
      const response = await apiService.getSport(parseInt(id!));
      setSport(response.data);
      setEditForm(response.data);
      
      setNewSubCategory({ name: "", gender: "Open", level: 1 });
      setShowAddSubCategory(false);
      
      toast({
        title: "Success",
        description: "Sub-category added successfully",
      });
    } catch (error) {
      console.error('Error adding sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to add sub-category",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubCategory = async (subCategoryId: string, updatedData: any) => {
    try {
      await apiService.updateSubCategory(parseInt(subCategoryId), updatedData);
      
      // Refresh sport details
      const response = await apiService.getSport(parseInt(id!));
      setSport(response.data);
      setEditForm(response.data);
      
      toast({
        title: "Success",
        description: "Sub-category updated successfully",
      });
    } catch (error) {
      console.error('Error updating sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to update sub-category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    try {
      await apiService.deleteSubCategory(subCategoryId);
      
      // Refresh sport details
      const response = await apiService.getSport(parseInt(id!));
      setSport(response.data);
      setEditForm(response.data);
      
      toast({
        title: "Success",
        description: "Sub-category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to delete sub-category",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sport details...</p>
        </div>
      </div>
    );
  }

  if (error || !sport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sport Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "The requested sport could not be found."}</p>
          <Button onClick={() => navigate('/admin/admin-sports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/admin-sports')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{sport.name || sport.sport_name}</h1>
            <p className="text-muted-foreground">Sport Details & Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpdateSport}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>
          )}
        </div>
      </div>

      {/* Sport Information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subcategories">Sub-Categories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sport Type</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant={sport.type === "Individual" ? "default" : "secondary"}>
                    {sport.type || "Individual"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Age Range</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sport.age_from } - {sport.age_to }
                </div>
                <p className="text-xs text-muted-foreground">Years</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gender</CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="outline">{sport.gender || "Open"}</Badge>
                </div>
              </CardContent>
            </Card>

            {sport.fees && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fees</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh {sport.fees}</div>
                </CardContent>
              </Card>
            )}

            {(sport.min_limit || sport.max_limit) && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Participant Limit</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sport.min_limit && sport.max_limit 
                      ? `${sport.min_limit} - ${sport.max_limit}`
                      : sport.min_limit || sport.max_limit
                    }
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sport Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      placeholder="Enter sport description..."
                    />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {sport.description || "No description available for this sport."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-Categories Tab */}
        <TabsContent value="subcategories" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sub-Categories</h3>
            <Button onClick={() => setShowAddSubCategory(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sub-Category
            </Button>
          </div>

          {sport.categories && sport.categories.length > 0 ? (
            <div className="space-y-4">
              {sport.categories.map((subCategory: any, index: number) => (
                <Card key={subCategory.id || index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{subCategory.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Level: {subCategory.level || 1}</span>
                          <span>Gender: {subCategory.gender || "Open"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle edit sub-category
                            const newName = prompt("Enter new name:", subCategory.name);
                            if (newName && newName.trim()) {
                              handleUpdateSubCategory(subCategory.id, {
                                ...subCategory,
                                name: newName.trim()
                              });
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Sub-Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{subCategory.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSubCategory(subCategory.id)}>
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
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sub-Categories</h3>
                <p className="text-muted-foreground text-center mb-4">
                  This sport doesn't have any sub-categories yet.
                </p>
                <Button onClick={() => setShowAddSubCategory(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Sub-Category
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sport Settings</CardTitle>
              <CardDescription>Configure sport-specific settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sportName">Sport Name</Label>
                      <Input
                        id="sportName"
                        value={editForm.sportName || editForm.name || ""}
                        onChange={(e) => setEditForm({...editForm, sportName: e.target.value, name: e.target.value})}
                        placeholder="Enter sport name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sportType">Sport Type</Label>
                      <Select
                        value={editForm.sportType || "Individual"}
                        onValueChange={(value) => setEditForm({...editForm, sportType: value})}
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ageFrom">Age From</Label>
                      <Input
                        id="ageFrom"
                        value={editForm.ageFrom || ""}
                        onChange={(e) => setEditForm({...editForm, ageFrom: e.target.value})}
                        placeholder="e.g., U6"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ageTo">Age To</Label>
                      <Input
                        id="ageTo"
                        value={editForm.ageTo || ""}
                        onChange={(e) => setEditForm({...editForm, ageTo: e.target.value})}
                        placeholder="e.g., U18"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={editForm.gender || "Open"}
                        onValueChange={(value) => setEditForm({...editForm, gender: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Open">Open</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fees">Fees (KSh )</Label>
                      <Input
                        id="fees"
                        type="number"
                        value={editForm.fees || ""}
                        onChange={(e) => setEditForm({...editForm, fees: e.target.value})}
                        placeholder="Enter fees"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="participantLimit">Participant Limit</Label>
                    <Input
                      id="participantLimit"
                      type="number"
                      value={editForm.participantLimit || ""}
                      onChange={(e) => setEditForm({...editForm, participantLimit: e.target.value})}
                      placeholder="Enter participant limit"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Sport Name</Label>
                      <p className="text-sm text-muted-foreground">{sport.name || sport.sport_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Sport Type</Label>
                      <p className="text-sm text-muted-foreground">{sport.type || "Individual"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Age Range</Label>
                      <p className="text-sm text-muted-foreground">{sport.age_from} - {sport.age_to}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Gender</Label>
                      <p className="text-sm text-muted-foreground">{sport.gender || "Open"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Fees</Label>
                      <p className="text-sm text-muted-foreground">{sport.fees ? `KSh ${sport.fees}` : "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Participant Limit</Label>
                      <p className="text-sm text-muted-foreground">
                        {sport.min_limit && sport.max_limit 
                          ? `${sport.min_limit} - ${sport.max_limit}`
                          : sport.min_limit || sport.max_limit || "Not set"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Sub-Category Dialog */}
      <Dialog open={showAddSubCategory} onOpenChange={setShowAddSubCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-Category</DialogTitle>
            <DialogDescription>Add a new sub-category for this sport.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subCategoryName">Name</Label>
              <Input
                id="subCategoryName"
                value={newSubCategory.name}
                onChange={(e) => setNewSubCategory({...newSubCategory, name: e.target.value})}
                placeholder="e.g., Under 16 Boys"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subCategoryGender">Gender</Label>
                <Select
                  value={newSubCategory.gender}
                  onValueChange={(value) => setNewSubCategory({...newSubCategory, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subCategoryLevel">Level</Label>
                <Select
                  value={newSubCategory.level.toString()}
                  onValueChange={(value) => setNewSubCategory({...newSubCategory, level: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddSubCategory(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubCategory}>
                Add Sub-Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SportDetails;
