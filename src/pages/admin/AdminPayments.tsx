import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Eye, Edit, Trash2, Download, CreditCard, HandHeart, Calendar, DollarSign, Building2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const AdminPayments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [sponsorFormData, setSponsorFormData] = useState({
    sponsorName: "",
    sponsorEmail: "",
    sponsoredAmount: "",
    notes: ""
  });
  
  // State for API data
  const [payments, setPayments] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch payments and institutions data
  const fetchData = async () => {
    try {
      const [paymentsResponse, institutionsResponse] = await Promise.all([
        apiService.getAdminPayments({
          search: searchTerm || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
        }),
        apiService.getAdminInstitutions()
      ]);
      
      if (paymentsResponse.data && typeof paymentsResponse.data === 'object') {
        const paymentsData = paymentsResponse.data as any;
        setPayments(paymentsData.payments || []);
      } else {
        setPayments([]);
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
        description: "Failed to fetch payments data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterStatus]);

  const handleViewInstitution = (institution: any) => {
    setSelectedInstitution(institution);
  };

  const handleEditPayment = (payment: any) => {
    // TODO: Implement edit payment functionality
    toast({
      title: "Feature Coming Soon",
      description: "Edit payment functionality will be implemented soon.",
    });
  };

  const handleDeletePayment = (paymentId: string) => {
    // TODO: Implement delete payment functionality
    toast({
      title: "Feature Coming Soon",
      description: "Delete payment functionality will be implemented soon.",
    });
  };

  const handleSponsorInstitution = () => {
    // TODO: Implement sponsorship functionality
    toast({
      title: "Feature Coming Soon",
      description: "Sponsorship functionality will be implemented soon.",
    });
    setSponsorFormData({ sponsorName: "", sponsorEmail: "", sponsoredAmount: "", notes: "" });
  };

  const exportPayments = () => {
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

  const getSponsorshipStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Applied": return "bg-yellow-100 text-yellow-800";
      case "Not Applied": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payments data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">Track and manage institution payments and sponsorships</p>
        </div>
        <Button onClick={exportPayments} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹0</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹0</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsored Amount</CardTitle>
            <HandHeart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹0</div>
            <p className="text-xs text-muted-foreground">Through sponsorships</p>
          </CardContent>
        </Card>
      </div>

      {/* Institutions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Institution Payments</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {institutions.length} institutions
            </span>
          </div>
        </div>

        {institutions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterStatus !== "all"
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
                        <Badge className={getPaymentStatusColor(institution.payment_status)}>
                          {institution.payment_status}
                        </Badge>
                        <Badge className={getSponsorshipStatusColor("Not Applied")}>
                          Not Applied
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Contact Person:</span> {institution.contact_person}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {institution.email}
                        </div>
                        <div>
                          <span className="font-medium">Last Payment:</span> N/A
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Total Amount:</span> ₹{institution.total_amount?.toLocaleString() || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Paid Amount:</span> ₹{institution.paid_amount?.toLocaleString() || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Pending Amount:</span> ₹{(institution.total_amount || 0) - (institution.paid_amount || 0)}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Invoice ID:</span> N/A
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPayment(institution)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <HandHeart className="h-4 w-4 mr-2" />
                            Sponsor
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Sponsor Institution</DialogTitle>
                            <DialogDescription>
                              Provide sponsorship for {institution.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Sponsor Name</label>
                              <Input
                                value={sponsorFormData.sponsorName}
                                onChange={(e) => setSponsorFormData({...sponsorFormData, sponsorName: e.target.value})}
                                placeholder="Enter sponsor name"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Sponsor Email</label>
                              <Input
                                type="email"
                                value={sponsorFormData.sponsorEmail}
                                onChange={(e) => setSponsorFormData({...sponsorFormData, sponsorEmail: e.target.value})}
                                placeholder="Enter sponsor email"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Sponsored Amount</label>
                              <Input
                                type="number"
                                value={sponsorFormData.sponsoredAmount}
                                onChange={(e) => setSponsorFormData({...sponsorFormData, sponsoredAmount: e.target.value})}
                                placeholder="Enter amount"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Notes</label>
                              <Input
                                value={sponsorFormData.notes}
                                onChange={(e) => setSponsorFormData({...sponsorFormData, notes: e.target.value})}
                                placeholder="Enter notes"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Cancel</Button>
                              <Button onClick={handleSponsorInstitution}>Sponsor</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Institution Details Dialog */}
      <Dialog>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Institution Payment Details</DialogTitle>
            <DialogDescription>
              View and manage payment information for {selectedInstitution?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedInstitution && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Institution Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedInstitution.name}</p>
                    <p><span className="font-medium">Contact Person:</span> {selectedInstitution.contact_person}</p>
                    <p><span className="font-medium">Email:</span> {selectedInstitution.email}</p>
                    <p><span className="font-medium">Type:</span> {selectedInstitution.institution_type || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Payment Status</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getPaymentStatusColor(selectedInstitution.payment_status)}`}>
                        {selectedInstitution.payment_status}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Total Amount:</span> ₹{selectedInstitution.total_amount?.toLocaleString() || 0}</p>
                    <p><span className="font-medium">Paid Amount:</span> ₹{selectedInstitution.paid_amount?.toLocaleString() || 0}</p>
                    <p><span className="font-medium">Pending Amount:</span> ₹{(selectedInstitution.total_amount || 0) - (selectedInstitution.paid_amount || 0)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex gap-2">
                  <Button onClick={() => handleEditPayment(selectedInstitution)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Payment
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedInstitution(null)}>
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

export default AdminPayments;