// 

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Eye, Trash2, Plus, UserPlus, Download, CreditCard, HandHeart, Loader2, AlertCircle, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { INSTITUTE_TYPES, getInstituteOptions } from "@/lib/institutionData";
import { useNavigate } from "react-router-dom";

const AdminInstitutions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInstitutionType, setSelectedInstitutionType] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [showSponsorshipInfo, setShowSponsorshipInfo] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [formData, setFormData] = useState({
    institution_type: "",
    name: "",
    email: "",
  });
  
  // State for API data
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInstitutions, setTotalInstitutions] = useState(0);
  const [institutionsPerPage] = useState(10);
  const [institutionDetails, setInstitutionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch institutions data
  const fetchInstitutions = async (page: number = currentPage) => {
    try {
      setInstitutionsLoading(true);
      const searchParams = {
        search: searchTerm,
        institution_type: selectedInstitutionType !== "all" ? selectedInstitutionType : undefined,
        payment_status: selectedPaymentStatus !== "all" ? selectedPaymentStatus : undefined,
        skip: (page - 1) * institutionsPerPage,
        limit: institutionsPerPage,
      };
      console.log('Fetching institutions with params:', searchParams);
      const response = await apiService.getAdminInstitutions(searchParams);

      if (response.data?.success) {
        console.log('Institutions response:', response.data.data);
        setInstitutions(response.data.data.institutions);
        setTotalInstitutions(response.data.data.total);
        setCurrentPage(page);
      } else {
        console.error("Failed to fetch institutions:", response.data);
        toast({
          title: "Error",
          description: response.data?.message || "Failed to fetch institutions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch institutions. Please check if the server is running.",
        variant: "destructive",
      });
    } finally {
      setInstitutionsLoading(false);
    }
  };

  // Fetch institution details for modal
  const fetchInstitutionDetails = async (institutionId: number) => {
    try {
      setLoadingDetails(true);
      const response = await apiService.getAdminInstitutionDetails(institutionId);
      
      if (response.data?.success) {
        setInstitutionDetails(response.data.data);
      } else {
        console.error("Failed to fetch institution details:", response.data);
        toast({
          title: "Error",
          description: response.data?.message || "Failed to fetch institution details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching institution details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch institution details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewInstitution = (institution: any) => {
    navigate(`/admin/admin-institutions/${institution.id}`);
  };


  const handleDeleteInstitution = async (institution: any) => {
    try {
      console.log("Deleting institution:", institution);
      
      // Call the delete API
      const response = await apiService.deleteInstitution(institution.id);
      
      if (response.data?.success) {
        // Remove the institution from the local state
        setInstitutions(prev => prev.filter(inst => inst.id !== institution.id));
        setTotalInstitutions(prev => prev - 1);
        
        toast({
          title: "Success",
          description: `Institution "${institution.name}" deleted successfully`,
          variant: "default",
        });
      } else {
        throw new Error(response.data?.message || "Failed to delete institution");
      }
    } catch (error) {
      console.error("Error deleting institution:", error);
      toast({
        title: "Error",
        description: "Failed to delete institution. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddInstitution = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.institution_type) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      console.log("Creating institution with data:", formData);
      
      // Call the API to create institution
      const response = await apiService.addInstitution(formData);
      console.log("Institution creation response:", response);
      
      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: response.data.message || "Institution added successfully",
        });
        setShowAddForm(false);
        setFormData({
          institution_type: "",
          name: "",
          email: "",
        });
        await fetchInstitutions();
      } else {
        throw new Error(response.data?.message || "Failed to create institution");
      }
    } catch (error) {
      console.error("Error adding institution:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add institution. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInstitution = async () => {
    try {
      // Add institution update logic here
      toast({
        title: "Success",
        description: "Institution updated successfully",
      });
      await fetchInstitutions();
    } catch (error) {
      console.error("Error updating institution:", error);
      toast({
        title: "Error",
        description: "Failed to update institution. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Trigger search when search term changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchInstitutions(1); // Reset to first page when searching
      } else {
        fetchInstitutions(1); // Also fetch when clearing search
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Trigger search when filters change
  useEffect(() => {
    fetchInstitutions(1); // Reset to first page when filters change
  }, [selectedInstitutionType, selectedPaymentStatus]);

  // Use institutions directly since server handles filtering
  const filteredInstitutions = institutions;

  const totalPages = Math.ceil(totalInstitutions / institutionsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Institutions</h1>
          <p className="text-muted-foreground">
            Manage and monitor all registered institutions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Institution
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedInstitutionType} onValueChange={setSelectedInstitutionType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Institution Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {INSTITUTE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Institutions List */}
      {institutionsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-muted-foreground">
            {searchTerm ? `Searching for "${searchTerm}"...` : "Loading institutions..."}
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInstitutions.map((institution) => (
            <Card key={institution.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {institution.name || "Unnamed Institution"}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {institution.email || "No email provided"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">{institution.type || "Unknown Type"}</Badge>
                          <Badge 
                            variant={institution.payment_status === "Paid" ? "default" : "secondary"}
                          >
                            {institution.payment_status || "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Total Amount:</span> ₹{institution.total_amount?.toLocaleString() || 0}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Paid Amount:</span> ₹{institution.paid_amount?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInstitution(institution)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Institution</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{institution.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteInstitution(institution)}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * institutionsPerPage) + 1} to {Math.min(currentPage * institutionsPerPage, totalInstitutions)} of {totalInstitutions} institutions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchInstitutions(currentPage - 1)}
              disabled={currentPage === 1 || institutionsLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchInstitutions(currentPage + 1)}
              disabled={currentPage === totalPages || institutionsLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Institution Dialog */}
      <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Institution</SheetTitle>
            <SheetDescription>Provide institute type, name and email</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label htmlFor="institution_type">Institution Type</Label>
              <Select value={formData.institution_type} onValueChange={(value) => setFormData(prev => ({ ...prev, institution_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Institution Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter institution name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleAddInstitution} className="flex-1">
                Add Institution
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminInstitutions;