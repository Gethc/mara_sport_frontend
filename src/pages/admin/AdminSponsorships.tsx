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
  });
  
  // State for API data
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sponsorships and institutions data
  const fetchData = async () => {
    try {
      const [sponsorshipsResponse, institutionsResponse] = await Promise.all([
        apiService.getAdminSponsorships(),
        apiService.getAdminInstitutions()
      ]);
      
      if (sponsorshipsResponse.data && typeof sponsorshipsResponse.data === 'object') {
        const sponsorshipsData = sponsorshipsResponse.data as any;
        setSponsorships(sponsorshipsData.sponsorships || []);
      } else {
        setSponsorships([]);
      }
      
      if (institutionsResponse.data && typeof institutionsResponse.data === 'object') {
        const institutionsData = institutionsResponse.data as any;
        setInstitutions(institutionsData.institutions || []);
      } else {
        setInstitutions([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleAddSponsor = () => {
    // TODO: Implement add sponsor functionality
    toast({
      title: "Feature Coming Soon",
      description: "Add sponsor functionality will be implemented soon.",
    });
    setShowAddSponsorDialog(false);
    setSponsorFormData({ name: "", email: "", phone: "", company: "", amount: "" });
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
                      onChange={(e) => setSponsorFormData({...sponsorFormData, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={sponsorFormData.phone}
                      onChange={(e) => setSponsorFormData({...sponsorFormData, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Sponsorship Amount</label>
                  <Input
                    type="number"
                    value={sponsorFormData.amount}
                    onChange={(e) => setSponsorFormData({...sponsorFormData, amount: e.target.value})}
                    placeholder="Enter sponsorship amount"
                  />
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
            <div className="text-2xl font-bold">{sponsorships.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Sponsors</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-muted-foreground">Active sponsors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹0</div>
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
              {sponsorships.length} sponsorships
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
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{sponsorship.name || "N/A"}</h3>
                        <Badge className={getStatusColor(sponsorship.status || "Pending")}>
                          {sponsorship.status || "Pending"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Company:</span> {sponsorship.company || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {sponsorship.email || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {sponsorship.phone || "N/A"}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Amount:</span> ₹{sponsorship.amount?.toLocaleString() || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Applied Date:</span> {sponsorship.applied_date || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Notes:</span> {sponsorship.notes || "N/A"}
                        </div>
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
                  <h4 className="font-medium mb-2">Sponsor Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedSponsorship.name || "N/A"}</p>
                    <p><span className="font-medium">Company:</span> {selectedSponsorship.company || "N/A"}</p>
                    <p><span className="font-medium">Email:</span> {selectedSponsorship.email || "N/A"}</p>
                    <p><span className="font-medium">Phone:</span> {selectedSponsorship.phone || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sponsorship Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Amount:</span> ₹{selectedSponsorship.amount?.toLocaleString() || 0}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedSponsorship.status || "Pending")}`}>
                        {selectedSponsorship.status || "Pending"}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Applied Date:</span> {selectedSponsorship.applied_date || "N/A"}</p>
                    <p><span className="font-medium">Approved Date:</span> {selectedSponsorship.approved_date || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{selectedSponsorship.notes || "No notes available"}</p>
              </div>
              
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