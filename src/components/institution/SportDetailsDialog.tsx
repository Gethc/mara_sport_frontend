import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Trophy, Calendar, Edit, Plus, X } from "lucide-react";

interface SportDetailsDialogProps {
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
    enrolledStudents: Array<{
      id: string;
      studentId: string;
      firstName: string;
      lastName: string;
      fullName: string;
      age: number;
      gender: string;
      category: string;
      subCategory: string;
      ageGroup: string;
    }>;
    totalEnrolled: number;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
  onEdit: () => void;
  onAddStudent: () => void;
}

const SportDetailsDialog = ({ sport, onClose, onEdit, onAddStudent }: SportDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const getSportTypeColor = (type: string) => {
    switch (type) {
      case "Individual": return "bg-blue-100 text-blue-800";
      case "Team": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{sport.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getSportTypeColor(sport.type)}>
                  {sport.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {sport.totalEnrolled} students enrolled
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onAddStudent} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button onClick={onEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students ({sport.totalEnrolled})</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sport Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sport Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{sport.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge className={getSportTypeColor(sport.type)}>
                      {sport.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Enrolled:</span>
                    <span className="font-medium">{sport.totalEnrolled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(sport.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(sport.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {sport.totalEnrolled}
                    </div>
                    <div className="text-sm text-blue-600">Total Students</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Trophy className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {sport.categories.length}
                    </div>
                    <div className="text-sm text-green-600">Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Enrolled Students</h3>
              <Button onClick={onAddStudent} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>

            {sport.enrolledStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
                <p className="text-muted-foreground mb-4">
                  No students have been enrolled in this sport yet.
                </p>
                <Button onClick={onAddStudent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Student
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>Age Group</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sport.enrolledStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.studentId}
                        </TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.age}</TableCell>
                        <TableCell>
                          <Badge className={getGenderColor(student.gender)}>
                            {student.gender}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.category}</TableCell>
                        <TableCell>{student.subCategory}</TableCell>
                        <TableCell>{student.ageGroup}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <h3 className="text-lg font-semibold">Sport Categories</h3>
            
            {sport.categories.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Categories</h3>
                <p className="text-muted-foreground">
                  No categories have been defined for this sport.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sport.categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">{category.name}</h4>
                      <Badge variant="outline">
                        {category.subCategories.length} sub-categories
                      </Badge>
                    </div>
                    
                    {category.subCategories.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">
                          Sub-Categories:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {category.subCategories.map((subCategory) => (
                            <div
                              key={subCategory.id}
                              className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-md"
                            >
                              <span className="text-sm">{subCategory.name}</span>
                              <Badge className={getGenderColor(subCategory.gender)}>
                                {subCategory.gender}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Level {subCategory.level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SportDetailsDialog;
