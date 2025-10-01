import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, Filter, Plus, Eye, Edit, Users, Trophy, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import AddStudentToSportDialog from "@/components/institution/AddStudentToSportDialog";
import SportDetailsDialog from "@/components/institution/SportDetailsDialog";
import EditSportDialog from "@/components/institution/EditSportDialog";

interface Sport {
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
}

const InstitutionSportsManagement = () => {
  const { toast } = useToast();
  
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sportTypeFilter, setSportTypeFilter] = useState("all");
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  // Removed dummy data - using real data from API only

  const fetchSports = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching sports from API...');
      const response = await apiService.getInstitutionSports();
      console.log('📥 Sports API Response:', response);
      
      if (response.data && response.data.data && response.data.data.sports) {
        console.log('✅ Sports found:', response.data.data.sports);
        setSports(response.data.data.sports);
      } else {
        console.log('⚠️ No sports in response - institution may not have enrolled in any sports yet');
        setSports([]);
      }
    } catch (error) {
      console.error("❌ Error fetching sports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sports data. Please check your connection and try again.",
        variant: "destructive",
      });
      setSports([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSports = sports.filter(sport => {
    const matchesSearch = sport.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = sportTypeFilter === "all" || sport.type === sportTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleViewDetails = (sport: Sport) => {
    setSelectedSport(sport);
    setShowDetails(true);
  };

  const handleEditSport = (sport: Sport) => {
    setSelectedSport(sport);
    setShowEdit(true);
  };


  const getSportTypeColor = (type: string) => {
    switch (type) {
      case "Individual": return "bg-blue-100 text-blue-800";
      case "Team": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEnrollmentStatus = (count: number) => {
    if (count === 0) return { text: "No enrollments", color: "text-red-600" };
    if (count < 5) return { text: "Low enrollment", color: "text-yellow-600" };
    if (count < 20) return { text: "Good enrollment", color: "text-blue-600" };
    return { text: "High enrollment", color: "text-green-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading sports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sports Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage and view sports with enrolled students
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={fetchSports}
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
          <Button 
            onClick={() => setShowAddStudent(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student to Sport
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Sports</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by sport name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sport Type</label>
              <Select value={sportTypeFilter} onValueChange={setSportTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium">Total Sports</label>
              <div className="text-2xl font-bold text-primary">
                {filteredSports.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sports List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredSports.map((sport) => {
          const enrollmentStatus = getEnrollmentStatus(sport.totalEnrolled);
          return (
            <Card key={sport.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">{sport.name}</CardTitle>
                    <Badge className={`${getSportTypeColor(sport.type)} text-xs`}>
                      {sport.type}
                    </Badge>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(sport)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSport(sport)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Categories */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sport.categories.slice(0, 2).map((category) => (
                      <Badge key={category.id} variant="outline" className="text-xs">
                        {category.name}
                      </Badge>
                    ))}
                    {sport.categories.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{sport.categories.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Enrolled Students */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Enrolled Students</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{sport.totalEnrolled}</span>
                    <span className={`text-sm ${enrollmentStatus.color}`}>
                      {enrollmentStatus.text}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(sport)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredSports.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sports Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || sportTypeFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "No sports have been enrolled for your institution yet. Contact the admin to enroll in sports."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sport Details Dialog */}
      {showDetails && selectedSport && (
        <SportDetailsDialog
          sport={selectedSport}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            setShowEdit(true);
          }}
        />
      )}

      {/* Edit Sport Dialog */}
      {showEdit && selectedSport && (
        <EditSportDialog
          sport={selectedSport}
          onClose={() => setShowEdit(false)}
          onSave={fetchSports}
        />
      )}

      {/* Add Student to Sport Dialog */}
      {showAddStudent && (
        <AddStudentToSportDialog
          onClose={() => setShowAddStudent(false)}
          onSave={fetchSports}
        />
      )}

    </div>
  );
};

export default InstitutionSportsManagement;
