import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, FileText, Download, Eye, Calendar, DollarSign, Building2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const AdminInvoices = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  
  // State for API data
  const [invoices, setInvoices] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch invoices and institutions data
  const fetchData = async () => {
    try {
      const [invoicesResponse, institutionsResponse] = await Promise.all([
        apiService.getAdminInvoices({
          search: searchTerm || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
        }),
        apiService.getAdminInstitutions()
      ]);
      
      if (invoicesResponse.data && typeof invoicesResponse.data === 'object') {
        const invoicesData = invoicesResponse.data as any;
        setInvoices(invoicesData.invoices || []);
      } else {
        setInvoices([]);
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
        description: "Failed to fetch invoices data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterStatus]);

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleEditInvoice = (invoice: any) => {
    // TODO: Implement edit invoice functionality
    toast({
      title: "Feature Coming Soon",
      description: "Edit invoice functionality will be implemented soon.",
    });
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    // TODO: Implement delete invoice functionality
    toast({
      title: "Feature Coming Soon",
      description: "Delete invoice functionality will be implemented soon.",
    });
  };

  const generateInvoice = (institution: any) => {
    // TODO: Implement generate invoice functionality
    toast({
      title: "Feature Coming Soon",
      description: "Generate invoice functionality will be implemented soon.",
    });
  };

  const exportInvoices = () => {
    // TODO: Implement export functionality
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be implemented soon.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Partial": return "bg-yellow-100 text-yellow-800";
      case "Pending": return "bg-red-100 text-red-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invoices data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Generate and manage institution invoices</p>
        </div>
        <Button onClick={exportInvoices} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search invoices..."
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
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <Building2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Institutions List (for generating invoices) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Institution Invoices</h2>
          <div className="flex items-center gap-2">
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
                        <Badge className={getStatusColor(institution.payment_status)}>
                          {institution.payment_status}
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
                          <span className="font-medium">Invoice Number:</span> N/A
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
                          <span className="font-medium text-muted-foreground">Due Date:</span> N/A
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(institution)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(institution)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateInvoice(institution)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View and manage invoice for {selectedInvoice?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Institution Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedInvoice.name}</p>
                    <p><span className="font-medium">Contact Person:</span> {selectedInvoice.contact_person}</p>
                    <p><span className="font-medium">Email:</span> {selectedInvoice.email}</p>
                    <p><span className="font-medium">Type:</span> {selectedInvoice.institution_type || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Invoice Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Invoice Number:</span> N/A</p>
                    <p><span className="font-medium">Invoice Date:</span> N/A</p>
                    <p><span className="font-medium">Due Date:</span> N/A</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedInvoice.payment_status)}`}>
                        {selectedInvoice.payment_status}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Financial Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Total Amount:</span> ₹{selectedInvoice.total_amount?.toLocaleString() || 0}</p>
                  <p><span className="font-medium">Paid Amount:</span> ₹{selectedInvoice.paid_amount?.toLocaleString() || 0}</p>
                  <p><span className="font-medium">Pending Amount:</span> ₹{(selectedInvoice.total_amount || 0) - (selectedInvoice.paid_amount || 0)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex gap-2">
                  <Button onClick={() => handleEditInvoice(selectedInvoice)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Edit Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
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

export default AdminInvoices;