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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Eye, Edit, Trash2, Plus, UserPlus, Download, CreditCard, HandHeart, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { INSTITUTE_TYPES, getInstituteOptions } from "@/lib/institutionData";

const AdminInstitutions = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
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
    setInstitutionsLoading(true);
    try {
      const skip = (page - 1) * institutionsPerPage;
      const response = await apiService.getAdminInstitutions({
        search: searchTerm || undefined,
        institution_type: selectedInstitutionType !== "all" ? selectedInstitutionType : undefined,
        payment_status: selectedPaymentStatus !== "all" ? selectedPaymentStatus : undefined,
        skip: skip,
        limit: institutionsPerPage
      });
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        setInstitutions(data.data?.institutions || []);
        setTotalInstitutions(data.data?.total || 0);
      } else {
        setInstitutions([]);
        setTotalInstitutions(0);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch institutions data",
        variant: "destructive",
      });
    } finally {
      setInstitutionsLoading(false);
    }
  };

  // Fetch institution types
  const fetchInstitutionTypes = async () => {
    try {
      const response = await apiService.getAdminInstitutionTypes();
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        setInstitutionTypes(data.data?.institution_types || []);
      }
    } catch (error) {
      console.error('Error fetching institution types:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchInstitutionTypes(), fetchInstitutions()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchInstitutions(1);
  }, [searchTerm, selectedInstitutionType, selectedPaymentStatus]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchInstitutions(page);
  };

  // Fetch institution details
  const fetchInstitutionDetails = async (institutionId: number) => {
    setLoadingDetails(true);
    try {
      const response = await apiService.getInstitutionDetails(institutionId);
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        if (data.success && data.data) {
          setInstitutionDetails(data.data.institution);
        }
      }
    } catch (error) {
      console.error('Error fetching institution details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch institution details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewInstitution = (institution: any) => {
    setSelectedInstitution(institution);
    fetchInstitutionDetails(institution.id);
  };

  const handleEditInstitution = (institution: any) => {
    setSelectedInstitution(institution);
    setEditMode(true);
    setFormData({
      name: institution.name,
      email: institution.email,
      institution_type: institution.institution_type || "",
    });
  };

  const handleDeleteInstitution = (institutionId: string) => {
    // TODO: Implement delete institution API call
    toast({
      title: "Feature Coming Soon",
      description: "Delete institution functionality will be implemented soon.",
    });
  };

  const handleAddInstitution = () => {
    // TODO: Implement add institution API call
    toast({
      title: "Feature Coming Soon",
      description: "Add institution functionality will be implemented soon.",
    });
    setShowAddForm(false);
  };

  const handleUpdateInstitution = () => {
    // TODO: Implement update institution API call
    toast({
      title: "Feature Coming Soon",
      description: "Update institution functionality will be implemented soon.",
    });
    setEditMode(false);
    setSelectedInstitution(null);
  };

  const exportInstitutions = () => {
    // TODO: Implement export functionality
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be implemented soon.",
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Partial": return "bg-yellow-100 text-yellow-800";
      case "Pending": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationStatusColor = (verified: boolean) => {
    return verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading institutions data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Institution Management</h1>
          <p className="text-muted-foreground">Manage registered institutions and their details</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportInstitutions} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Institution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Institution</DialogTitle>
                <DialogDescription>Provide institute type, name and email</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="institution_type">Institute Type</Label>
                  <Select value={formData.institution_type} onValueChange={(v) => setFormData({ ...formData, institution_type: v, name: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institute type" />
                    </SelectTrigger>
                    <SelectContent>
                  {INSTITUTE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Institute Name</Label>
                  {formData.institution_type === "Other" ? (
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter institute name" />
                  ) : (
                    <Select value={formData.name} onValueChange={(v) => setFormData({ ...formData, name: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select institute name" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {getInstituteOptions(formData.institution_type).map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Institute Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter institute email" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddInstitution}>
                    Add Institution
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search institutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedInstitutionType} onValueChange={setSelectedInstitutionType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Institution Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Institution Types</SelectItem>
            {institutionTypes.map((type) => (
              <SelectItem key={type.id} value={type.value}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Institution List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Institution List</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {totalInstitutions} institutions
            </span>
          </div>
        </div>

        {institutionsLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading institutions...</span>
            </CardContent>
          </Card>
        ) : (institutions || []).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedInstitutionType !== "all" || selectedPaymentStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No institutions have been registered yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(institutions || []).map((institution) => (
              <Card key={institution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{institution.name}</h3>
                        <Badge className={getVerificationStatusColor(institution.verified)}>
                          {institution.verified ? "Verified" : "Pending"}
                        </Badge>
                        <Badge className={getPaymentStatusColor(institution.payment_status)}>
                          {institution.payment_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Type:</span> {institution.institution_type || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Contact:</span> {institution.contact_person}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {institution.email}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Students:</span> {institution.sports_enrolled || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Sports:</span> {institution.sports_enrolled || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Total Amount:</span> ₹{institution.total_amount?.toLocaleString() || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Paid Amount:</span> ₹{institution.paid_amount?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInstitution(institution)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {selectedInstitution?.name || institution.name}
                            </DialogTitle>
                            <DialogDescription>
                              Institution details and management
                            </DialogDescription>
                          </DialogHeader>
                          {selectedInstitution && (
                            <div className="space-y-6 mt-6 max-h-[70vh] overflow-y-auto">
                              {loadingDetails ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                  <span className="text-muted-foreground">Loading details...</span>
                                </div>
                              ) : institutionDetails ? (
                                <>
                                  {/* Basic Information */}
                                  <div>
                                    <h4 className="font-medium mb-3 text-lg">Basic Information</h4>
                                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                                      <p><span className="font-medium">Name:</span> {institutionDetails.name}</p>
                                      <p><span className="font-medium">Email:</span> {institutionDetails.email || "N/A"}</p>
                                      <p><span className="font-medium">Type:</span> {institutionDetails.type}</p>
                                    </div>
                                  </div>

                                  {/* Contact Information */}
                                  <div>
                                    <h4 className="font-medium mb-3 text-lg">Contact Information</h4>
                                    {institutionDetails.contact_persons && institutionDetails.contact_persons.length > 0 ? (
                                      <div className="space-y-2">
                                        {institutionDetails.contact_persons.map((contact: any, index: number) => (
                                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                            <p><span className="font-medium">Name:</span> {contact.name}</p>
                                            <p><span className="font-medium">Designation:</span> {contact.designation}</p>
                                            <p><span className="font-medium">Phone:</span> {contact.phone}</p>
                                            <p><span className="font-medium">Email:</span> {contact.email}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No contact persons available</p>
                                    )}
                                  </div>

                                  {/* Payment Information */}
                                  <div>
                                    <h4 className="font-medium mb-3 text-lg">Payment Information</h4>
                                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                                      <p><span className="font-medium">Total Amount:</span> ₹{institutionDetails.payment_info?.total_amount?.toLocaleString() || 0}</p>
                                      <p><span className="font-medium">Paid Amount:</span> ₹{institutionDetails.payment_info?.paid_amount?.toLocaleString() || 0}</p>
                                      <p><span className="font-medium">Pending Amount:</span> ₹{institutionDetails.payment_info?.pending_amount?.toLocaleString() || 0}</p>
                                      <Badge className={getPaymentStatusColor(institutionDetails.payment_info?.status || "Pending")}>
                                        {institutionDetails.payment_info?.status || "Pending"}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Students */}
                                  <div>
                                    <h4 className="font-medium mb-3 text-lg">Students ({institutionDetails.students?.length || 0})</h4>
                                    {institutionDetails.students && institutionDetails.students.length > 0 ? (
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {institutionDetails.students.map((student: any, index: number) => (
                                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                            <p><span className="font-medium">Name:</span> {student.name}</p>
                                            <p><span className="font-medium">Email:</span> {student.email}</p>
                                            <p><span className="font-medium">Phone:</span> {student.phone}</p>
                                            <p><span className="font-medium">Student ID:</span> {student.student_id}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No students registered</p>
                                    )}
                                  </div>

                                  {/* Sports Assignments */}
                                  <div>
                                    <h4 className="font-medium mb-3 text-lg">Sports Assignments ({institutionDetails.sports_assignments?.length || 0})</h4>
                                    {institutionDetails.sports_assignments && institutionDetails.sports_assignments.length > 0 ? (
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {institutionDetails.sports_assignments.map((assignment: any, index: number) => (
                                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                            <p><span className="font-medium">Sport:</span> {assignment.sport_name} ({assignment.sport_type})</p>
                                            <p><span className="font-medium">Student:</span> {assignment.student_name}</p>
                                            <p><span className="font-medium">Fee:</span> ₹{assignment.fee}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No sports assignments</p>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-8">
                                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                  <p className="text-muted-foreground">Failed to load institution details</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInstitution(institution)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
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
                            <AlertDialogAction onClick={() => handleDeleteInstitution(institution.id)}>
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
        {totalInstitutions > institutionsPerPage && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * institutionsPerPage) + 1} to {Math.min(currentPage * institutionsPerPage, totalInstitutions)} of {totalInstitutions} institutions
                      </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
                        </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(totalInstitutions / institutionsPerPage) }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || 
                           page === Math.ceil(totalInstitutions / institutionsPerPage) || 
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
                disabled={currentPage === Math.ceil(totalInstitutions / institutionsPerPage)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
                      </div>
                    </div>
                  )}
                  </div>

    </div>
  );
};

export default AdminInstitutions;