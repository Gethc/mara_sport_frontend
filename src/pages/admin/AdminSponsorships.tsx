import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Eye, Edit, Trash2, Download, HandHeart, Building2, DollarSign, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { validatePhoneNumber, validateEmail, handlePhoneChange, handleEmailChange } from "@/utils/validation";

const AdminSponsorships = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSponsorship, setSelectedSponsorship] = useState<any>(null);
  const [showSponsorshipDialog, setShowSponsorshipDialog] = useState(false);
  const [showAddSponsorDialog, setShowAddSponsorDialog] = useState(false);
  const [sponsorFormData, setSponsorFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    amount: "",
    type: "partial",
  });
  
  // State for API data
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate summary statistics
  const totalSponsors = sponsorships.length;
  const approvedSponsors = sponsorships.filter(s => s.status === 'Approved').length;
  const pendingApplications = sponsorships.filter(s => s.status === 'Applied' || s.status === 'Pending').length;
  const totalAmount = sponsorships.reduce((sum, s) => sum + (s.amount || 0), 0);

  // Debug logging
  console.log('🔍 Current sponsorships state:', sponsorships);
  console.log('🔍 Total sponsors calculated:', totalSponsors);
  console.log('🔍 Pending applications calculated:', pendingApplications);
  console.log('🔍 Total amount calculated:', totalAmount);

  // Fetch sponsorships and institutions data
  const fetchData = async () => {
    try {
      console.log('🔍 Starting to fetch sponsorships data...');
      const [sponsorshipsResponse, institutionsResponse] = await Promise.all([
        apiService.getAdminSponsorships(),
        apiService.getAdminInstitutions()
      ]);
      
      console.log('🔍 Raw sponsorships response:', sponsorshipsResponse);
      console.log('🔍 Raw institutions response:', institutionsResponse);
      
      if (sponsorshipsResponse && sponsorshipsResponse.data && typeof sponsorshipsResponse.data === 'object') {
        const sponsorshipsData = sponsorshipsResponse.data as any;
        console.log('🔍 Sponsorships API Response:', sponsorshipsResponse);
        console.log('🔍 Sponsorships Data:', sponsorshipsData);
        console.log('🔍 Sponsorships Array:', sponsorshipsData.sponsorships);
        console.log('🔍 Setting sponsorships to:', sponsorshipsData.sponsorships || []);
        setSponsorships(sponsorshipsData.sponsorships || []);
      } else {
        console.log('🔍 No sponsorships data in response, response structure:', sponsorshipsResponse);
        setSponsorships([]);
      }
      
      if (institutionsResponse && institutionsResponse.data && typeof institutionsResponse.data === 'object') {
        const institutionsData = institutionsResponse.data as any;
        console.log('🔍 Setting institutions to:', institutionsData.institutions || []);
        setInstitutions(institutionsData.institutions || []);
      } else {
        console.log('🔍 No institutions data in response');
        setInstitutions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      console.error('❌ Error details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sponsorships data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Debug effect to log sponsorships changes
  useEffect(() => {
    console.log('🔍 Sponsorships state changed:', sponsorships);
    console.log('🔍 Sponsorships length:', sponsorships.length);
  }, [sponsorships]);

  const handleViewSponsorship = (sponsorship: any) => {
    setSelectedSponsorship(sponsorship);
    setShowSponsorshipDialog(true);
  };

  const handleEditSponsorship = (sponsorship: any) => {
    // TODO: Implement edit sponsorship functionality
    toast({
      title: "Feature Coming Soon",
      description: "Edit sponsorship functionality will be implemented soon.",
    });
  };

  const handleDeleteSponsorship = (sponsorshipId: string) => {
    // TODO: Implement delete sponsorship functionality
    toast({
      title: "Feature Coming Soon",
      description: "Delete sponsorship functionality will be implemented soon.",
    });
  };

  const handleAddSponsor = async () => {
    try {
      // Validate required fields
      if (!sponsorFormData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Sponsor name is required",
          variant: "destructive",
        });
        return;
      }

      if (!sponsorFormData.email.trim()) {
        toast({
          title: "Validation Error",
          description: "Email is required",
          variant: "destructive",
        });
        return;
      }

      if (!validateEmail(sponsorFormData.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      if (!sponsorFormData.amount || parseFloat(sponsorFormData.amount) <= 0) {
        toast({
          title: "Validation Error",
          description: "Valid amount is required",
          variant: "destructive",
        });
        return;
      }

      // Prepare sponsor data
      const sponsorData = {
        name: sponsorFormData.name.trim(),
        email: sponsorFormData.email.trim(),
        phone: sponsorFormData.phone.trim() || null,
        company: sponsorFormData.company.trim() || null,
        amount: parseFloat(sponsorFormData.amount),
        type: sponsorFormData.type
      };
      
      console.log('🔍 Sending sponsor data:', sponsorData);

      // Create sponsor via API
      const response = await apiService.createSponsor(sponsorData);
      
      console.log('🔍 Create sponsor response:', response);
      
      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: "Sponsor created successfully!",
        });
        
        // Reset form and close dialog
        setSponsorFormData({ name: "", email: "", phone: "", company: "", amount: "", type: "partial" });
        setShowAddSponsorDialog(false);
        
        // Refresh sponsorships data
        fetchData();
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to create sponsor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating sponsor:', error);
      toast({
        title: "Error",
        description: "Failed to create sponsor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportSponsorships = () => {
    // TODO: Implement export functionality
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be implemented soon.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Applied": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Pending": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sponsorships data...</p>
        </div>
      </div>
    );
  }

  // Debug section - remove this after testing
  console.log('🔍 Rendering AdminSponsorships with:', {
    loading,
    sponsorshipsLength: sponsorships.length,
    totalSponsors,
    pendingApplications,
    totalAmount
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sponsorship Management</h1>
          <p className="text-muted-foreground">Manage sponsorships and sponsor relationships</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportSponsorships} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddSponsorDialog} onOpenChange={setShowAddSponsorDialog}>
            <DialogTrigger asChild>
              <Button>
                <HandHeart className="h-4 w-4 mr-2" />
                Add Sponsor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Sponsor</DialogTitle>
                <DialogDescription>
                  Register a new sponsor for the sports festival
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Sponsor Name</label>
                    <Input
                      value={sponsorFormData.name}
                      onChange={(e) => setSponsorFormData({...sponsorFormData, name: e.target.value})}
                      placeholder="Enter sponsor name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      value={sponsorFormData.company}
                      onChange={(e) => setSponsorFormData({...sponsorFormData, company: e.target.value})}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={sponsorFormData.email}
                      onChange={(e) => handleEmailChange(e.target.value, (value) => setSponsorFormData({...sponsorFormData, email: value}))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      type="tel"
                      value={sponsorFormData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value, (value) => setSponsorFormData({...sponsorFormData, phone: value}))}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Sponsorship Amount</label>
                    <Input
                      type="number"
                      value={sponsorFormData.amount}
                      onChange={(e) => setSponsorFormData({...sponsorFormData, amount: e.target.value})}
                      placeholder="Enter sponsorship amount"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sponsorship Type (Optional)</label>
                    <Select 
                      value={sponsorFormData.type} 
                      onValueChange={(value) => setSponsorFormData({...sponsorFormData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sponsorship type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddSponsorDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSponsor}>
                    Add Sponsor
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
            placeholder="Search sponsorships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sponsorship Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sponsors</CardTitle>
            <HandHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSponsors}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Sponsors</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedSponsors}</div>
            <p className="text-xs text-muted-foreground">Active sponsors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">KSh {totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sponsored amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Sponsorships List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sponsorship Applications</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {totalSponsors} sponsorships
            </span>
          </div>
        </div>

        {sponsorships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sponsorships found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No sponsorship applications have been submitted yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(sponsorships || []).map((sponsorship) => (
              <Card key={sponsorship.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Institution Information */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{sponsorship.institution?.name || "N/A"}</h3>
                          <Badge className={getStatusColor(sponsorship.status || "Applied")}>
                            {sponsorship.status || "Applied"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Institution Type:</span> {sponsorship.institution?.type || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {sponsorship.institution?.email || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {sponsorship.institution?.phone || "N/A"}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Amount:</span> KSh {sponsorship.amount?.toLocaleString() || 0}
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Type:</span> {sponsorship.type || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Applied Date:</span> {sponsorship.created_at ? new Date(sponsorship.created_at).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Reason:</span> {sponsorship.reason || "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSponsorship(sponsorship)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSponsorship(sponsorship)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSponsorship(sponsorship.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Students Information */}
                    {sponsorship.students && sponsorship.students.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            Students ({sponsorship.total_students})
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {sponsorship.total_sports} sports assigned
                          </span>
                        </div>
                        <div className="space-y-3">
                          {sponsorship.students.map((student: any) => (
                            <div key={student.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-sm">{student.name}</h5>
                                <span className="text-xs text-muted-foreground">{student.student_id}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {student.email}
                              </div>
                              {student.sports && student.sports.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Sports:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {student.sports.map((sport: any, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {sport.sport_name} (KSh {sport.fee})
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sponsorship Details Dialog */}
      <Dialog open={showSponsorshipDialog} onOpenChange={setShowSponsorshipDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sponsorship Details</DialogTitle>
            <DialogDescription>
              View and manage sponsorship application for {selectedSponsorship?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSponsorship && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Institution Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedSponsorship.institution?.name || "N/A"}</p>
                    <p><span className="font-medium">Type:</span> {selectedSponsorship.institution?.type || "N/A"}</p>
                    <p><span className="font-medium">Email:</span> {selectedSponsorship.institution?.email || "N/A"}</p>
                    <p><span className="font-medium">Phone:</span> {selectedSponsorship.institution?.phone || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sponsorship Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Amount:</span> KSh {selectedSponsorship.amount?.toLocaleString() || 0}</p>
                    <p><span className="font-medium">Type:</span> {selectedSponsorship.type || "N/A"}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedSponsorship.status || "Applied")}`}>
                        {selectedSponsorship.status || "Applied"}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Applied Date:</span> {selectedSponsorship.created_at ? new Date(selectedSponsorship.created_at).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Reason</h4>
                <p className="text-sm text-muted-foreground">{selectedSponsorship.reason || "No reason provided"}</p>
              </div>

              {/* Students Information */}
              {selectedSponsorship.students && selectedSponsorship.students.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Students ({selectedSponsorship.total_students})</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedSponsorship.students.map((student: any) => (
                      <div key={student.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{student.name}</h5>
                          <span className="text-xs text-muted-foreground">{student.student_id}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {student.email}
                        </div>
                        {student.sports && student.sports.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Sports:</div>
                            <div className="flex flex-wrap gap-1">
                              {student.sports.map((sport: any, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {sport.sport_name} (KSh {sport.fee})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex gap-2">
                  <Button onClick={() => handleEditSponsorship(selectedSponsorship)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Sponsorship
                  </Button>
                  <Button variant="outline" onClick={() => setShowSponsorshipDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSponsorships;