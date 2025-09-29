import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, X, Users, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [removingStudent, setRemovingStudent] = useState<any>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: sport.name,
    type: sport.type,
    sportType: sport.sportType,
  });


  const handleSave = async () => {
    // Since sport name and type are now read-only, just close the dialog
    onClose();
  };

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      // Fetch students enrolled in this specific sport
      const response = await apiService.getStudentsBySport(sport.id);
      console.log('API Response:', response);
      
      if (response.data && (response.data as any).success && (response.data as any).data && (response.data as any).data.students) {
        const enrolledStudents = (response.data as any).data.students;
        console.log('Enrolled students:', enrolledStudents);
        setEnrolledStudents(enrolledStudents);
      } else {
        console.log('No students found or API error');
        setEnrolledStudents([]);
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch enrolled students",
        variant: "destructive",
      });
      setEnrolledStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudentCategory = (student: any) => {
    setEditingStudent(student);
    setShowEditStudent(true);
  };

  const handleUpdateStudentCategory = async (studentId: number, categoryId: string, subCategoryId: string) => {
    try {
      setLoading(true);
      // Update student's sport assignment
      const response = await apiService.updateSportAssignment(studentId, {
        sportId: sport.id,
        categoryId: categoryId,
        subCategoryId: subCategoryId
      });
      
      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: "Student category updated successfully",
        });
        fetchEnrolledStudents(); // Refresh the list
        setShowEditStudent(false);
      }
    } catch (error) {
      console.error('Error updating student category:', error);
      toast({
        title: "Error",
        description: "Failed to update student category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudentFromSport = async (studentId: number) => {
    try {
      setLoading(true);
      // Remove student from sport entirely
      const response = await apiService.removeStudentFromSport(studentId, sport.id);
      
      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: "Student removed from sport successfully",
        });
        fetchEnrolledStudents(); // Refresh the list
        setShowRemoveConfirm(false);
        setRemovingStudent(null);
      }
    } catch (error) {
      console.error('Error removing student from sport:', error);
      toast({
        title: "Error",
        description: "Failed to remove student from sport",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudentFromCategory = async (studentId: number, categoryId: string) => {
    try {
      setLoading(true);
      // Remove student from specific category
      const response = await apiService.removeStudentFromCategory(studentId, categoryId);
      
      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: "Student removed from category successfully",
        });
        fetchEnrolledStudents(); // Refresh the list
        setShowRemoveConfirm(false);
        setRemovingStudent(null);
      }
    } catch (error) {
      console.error('Error removing student from category:', error);
      toast({
        title: "Error",
        description: "Failed to remove student from category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveStudent = (student: any, action: 'sport' | 'category', categoryId?: string) => {
    setRemovingStudent({ ...student, action, categoryId });
    setShowRemoveConfirm(true);
  };

  useEffect(() => {
    fetchEnrolledStudents();
  }, [sport.id]);


  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Sport Information: {sport.name}</DialogTitle>
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
          {/* Basic Sport Information - Read Only */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sportName">Sport Name</Label>
                <Input
                  id="sportName"
                  value={editForm.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sportType">Sport Type</Label>
                <Input
                  id="sportType"
                  value={editForm.type}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Categories Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories Information</h3>
            <p className="text-sm text-muted-foreground">
              Sport categories and sub-categories are managed by the system administrator. 
              You can only manage student assignments to these categories.
            </p>
            

            {/* Existing Categories */}
            <div className="space-y-3">
              {sport.categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="text-md font-medium">{category.name}</h4>
                  </div>

                  {/* Sub-Categories */}
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground">
                        Sub-Categories ({category.subCategories.length})
                      </h5>
                    </div>


                    {/* Existing Sub-Categories */}
                    <div className="space-y-2">
                      {category.subCategories.map((subCategory) => (
                        <div key={subCategory.id} className="flex items-center p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{subCategory.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({subCategory.gender}, Level {subCategory.level})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Students Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrolled Students ({enrolledStudents.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEnrolledStudents}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>

            {enrolledStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students enrolled in this sport yet.</p>
                <p className="text-sm">Use the "Add Student to Sport" button on the main page to enroll students.</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Note: Only students enrolled under your institution will be displayed here.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.fname} {student.mname} {student.lname}
                        </TableCell>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.sportAssignments && student.sportAssignments.length > 0 ? (
                              student.sportAssignments.map((assignment: any, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    {assignment.categoryName || 'Unknown Category'}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => confirmRemoveStudent(student, 'category', assignment.categoryId)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    title="Remove from category"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <Badge variant="outline">Not Assigned</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.sportAssignments && student.sportAssignments.length > 0 ? (
                              student.sportAssignments.map((assignment: any, index: number) => (
                                <Badge key={index} variant="outline">
                                  {assignment.subCategoryName || 'No Sub-Category'}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline">Not Assigned</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStudentCategory(student)}
                              title="Edit Category Assignment"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmRemoveStudent(student, 'sport')}
                              className="text-red-500 hover:text-red-700"
                              title="Remove from Sport"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Edit Student Category Dialog */}
      {showEditStudent && editingStudent && (
        <Dialog open={showEditStudent} onOpenChange={setShowEditStudent}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Student Category</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Student: {editingStudent.fname} {editingStudent.lname}</Label>
                <p className="text-sm text-muted-foreground">Student ID: {editingStudent.student_id}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {sport.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCategory">Sub-Category *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* This would be populated based on selected category */}
                    <SelectItem value="placeholder">Select category first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditStudent(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Handle save
                  toast({
                    title: "Info",
                    description: "Category update functionality will be implemented",
                  });
                  setShowEditStudent(false);
                }}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Remove Student Confirmation Dialog */}
      {showRemoveConfirm && removingStudent && (
        <Dialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Removal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to remove{' '}
                  <span className="font-medium">
                    {removingStudent.fname} {removingStudent.lname}
                  </span>{' '}
                  from{' '}
                  {removingStudent.action === 'sport' ? (
                    <span className="font-medium">{sport.name}</span>
                  ) : (
                    <span className="font-medium">this category</span>
                  )}?
                </p>
              </div>

              {removingStudent.action === 'sport' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> This will remove the student from the entire sport and all its categories.
                  </p>
                </div>
              )}

              {removingStudent.action === 'category' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> This will only remove the student from this specific category. 
                    They will remain enrolled in other categories of the sport.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowRemoveConfirm(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (removingStudent.action === 'sport') {
                    handleRemoveStudentFromSport(removingStudent.id);
                  } else {
                    handleRemoveStudentFromCategory(removingStudent.id, removingStudent.categoryId);
                  }
                }}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {removingStudent.action === 'sport' ? 'Remove from Sport' : 'Remove from Category'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default EditSportDialog;
