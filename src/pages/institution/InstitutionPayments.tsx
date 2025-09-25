import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Users,
  DollarSign,
  Trophy,
  CheckCircle,
  Clock,
  Send,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const InstitutionPayments = () => {
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showSponsorshipForm, setShowSponsorshipForm] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [sponsorshipForm, setSponsorshipForm] = useState({
    sponsorName: "",
    sponsorshipAmount: "",
    sponsorshipType: "full",
  });

  const [emailForm, setEmailForm] = useState({
    studentEmails: "",
    subject: "Payment Link for Sports Registration",
    message: "Dear Student, Please use the link below to complete your sports registration payment...",
  });
  
  // State for API data
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidStudents: 0,
    unpaidStudents: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const response = await apiService.getAdminStudents({
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      
      setStudents(response.data || []);
      
      // Calculate stats
      const totalStudents = response.data?.length || 0;
      const paidStudents = response.data?.filter((student: any) => student.payment_status === 'Paid').length || 0;
      const unpaidStudents = totalStudents - paidStudents;
      const totalAmount = response.data?.reduce((sum: number, student: any) => sum + (student.total_amount || 0), 0) || 0;
      const paidAmount = response.data?.filter((student: any) => student.payment_status === 'Paid')
        .reduce((sum: number, student: any) => sum + (student.paid_amount || 0), 0) || 0;
      const pendingAmount = totalAmount - paidAmount;
      
      setStats({
        totalStudents,
        paidStudents,
        unpaidStudents,
        totalAmount,
        paidAmount,
        pendingAmount,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, filterStatus]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      student.payment_status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handlePayNow = () => {
    // TODO: Implement payment functionality
    toast({
      title: "Feature Coming Soon",
      description: "Payment functionality will be implemented soon.",
    });
  };

  const handleSponsorshipSubmit = () => {
    // TODO: Implement sponsorship functionality
    toast({
      title: "Feature Coming Soon",
      description: "Sponsorship functionality will be implemented soon.",
    });
    setShowSponsorshipForm(false);
  };

  const handleEmailSend = () => {
    // TODO: Implement email functionality
    toast({
      title: "Feature Coming Soon",
      description: "Email functionality will be implemented soon.",
    });
    setShowEmailDialog(false);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Unpaid": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSponsorshipStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Applied": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Payment Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage student payments and sponsorships
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidStudents}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Students</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unpaidStudents}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalAmount}</div>
            <p className="text-xs text-muted-foreground">All registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Payments</CardTitle>
          <CardDescription>
            Manage and track student payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No students have been registered yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{student.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ID: {student.student_id} • {student.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={getPaymentStatusColor(student.payment_status || "Unpaid")}>
                          {student.payment_status || "Unpaid"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Total: ₹{student.total_amount || 0} | Paid: ₹{student.paid_amount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePayNow}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSponsorshipForm(true)}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Sponsor
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmailDialog(true)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sponsorship Form Dialog */}
      <Dialog open={showSponsorshipForm} onOpenChange={setShowSponsorshipForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Sponsorship</DialogTitle>
            <DialogDescription>
              Submit a sponsorship request for students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sponsorName">Sponsor Name</Label>
              <Input
                id="sponsorName"
                value={sponsorshipForm.sponsorName}
                onChange={(e) => setSponsorshipForm({...sponsorshipForm, sponsorName: e.target.value})}
                placeholder="Enter sponsor name"
              />
            </div>
            <div>
              <Label htmlFor="sponsorshipAmount">Sponsorship Amount</Label>
              <Input
                id="sponsorshipAmount"
                type="number"
                value={sponsorshipForm.sponsorshipAmount}
                onChange={(e) => setSponsorshipForm({...sponsorshipForm, sponsorshipAmount: e.target.value})}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="sponsorshipType">Sponsorship Type</Label>
              <Select value={sponsorshipForm.sponsorshipType} onValueChange={(value) => setSponsorshipForm({...sponsorshipForm, sponsorshipType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Sponsorship</SelectItem>
                  <SelectItem value="partial">Partial Sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSponsorshipForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSponsorshipSubmit}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send payment reminder emails to students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentEmails">Student Emails</Label>
              <Textarea
                id="studentEmails"
                value={emailForm.studentEmails}
                onChange={(e) => setEmailForm({...emailForm, studentEmails: e.target.value})}
                placeholder="Enter student emails (comma separated)"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                placeholder="Enter email subject"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailForm.message}
                onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                placeholder="Enter email message"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEmailSend}>
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionPayments;