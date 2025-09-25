// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { Building2, Users, CreditCard, HandHeart, Trophy, Clock, Search, Filter, Eye, AlertCircle, Loader2 } from "lucide-react";
// import { apiService } from "@/services/api";
// import { useToast } from "@/hooks/use-toast";

// const AdminDashboard = () => {
//   const { toast } = useToast();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSport, setSelectedSport] = useState("all");
//   const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
//   const [showPendingOnly, setShowPendingOnly] = useState(false);
//   const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  
//   // State for API data
//   const [stats, setStats] = useState({
//     total_institutions: 0,
//     active_institutions: 0,
//     verified_institutions: 0,
//     total_students: 0,
//     total_sports: 0,
//     total_sponsorships: 0,
//     total_payments: 0,
//     pending_payments: 0,
//   });
//   const [institutions, setInstitutions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [institutionsLoading, setInstitutionsLoading] = useState(false);
//   {console.log("djkdjdjddjdjkdjkdjjkdjkdjkjdjkddjkdjkkd",institutions)}
//   // Fetch dashboard stats
//   const fetchStats = async () => {
//     try {
//       console.log('Fetching admin dashboard stats...');
//       const response = await apiService.getAdminDashboardStats();
//       console.log('Dashboard stats response:', response);
//       if (response.data && typeof response.data === 'object') {
//         const data = response.data as any;
//         if (data.success && data.data) {
//           setStats(data.data as typeof stats);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch dashboard statistics",
//         variant: "destructive",
//       });
//     }
//   };

//   // Fetch institutions
//   const fetchInstitutions = async () => {
//     setInstitutionsLoading(true);
//     try {
//       console.log('Fetching admin institutions...');
//       const response = await apiService.getAdminInstitutions({
//         search: searchTerm || undefined,
//         status: selectedPaymentStatus !== "all" ? selectedPaymentStatus : undefined,
//       });
//       console.log('Institutions response:', response);
//       if (response.data && typeof response.data === 'object') {
//         const data = response.data as any;
//         setInstitutions(data.data.institutions || []);
//       }
//     } catch (error) {
//       console.error('Error fetching institutions:', error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch institutions",
//         variant: "destructive",
//       });
//     } finally {
//       setInstitutionsLoading(false);
//     }
//   };

//   // Load data on component mount
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         await Promise.all([fetchStats(), fetchInstitutions()]);
//       } catch (error) {
//         console.error('Error loading data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   // Refetch institutions when filters change
//   useEffect(() => {
//     fetchInstitutions();
//   }, [searchTerm, selectedPaymentStatus]);

//   const handlePendingPaymentsClick = () => {
//     setShowPendingOnly(!showPendingOnly);
//     setSelectedPaymentStatus(showPendingOnly ? "all" : "pending");
//   };

//   const getPaymentStatusColor = (status: string) => {
//     switch (status) {
//       case "Paid": return "bg-green-100 text-green-800";
//       case "Partial": return "bg-yellow-100 text-yellow-800";
//       case "Pending": return "bg-red-100 text-red-800";
//       default: return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getVerificationStatusColor = (verified: boolean) => {
//     return verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
//           <p className="text-muted-foreground">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
//         <p className="text-muted-foreground">System overview and management</p>
//       </div>


//       {/* Key Metrics */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//         <Card className="border-l-4 border-l-primary shadow-soft">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
//             <Building2 className="h-4 w-4 text-primary" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.total_institutions || 0}</div>
//             <p className="text-xs text-muted-foreground">
//               {stats.active_institutions || 0} active
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="border-l-4 border-l-accent shadow-soft">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Students</CardTitle>
//             <Users className="h-4 w-4 text-accent" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.total_students || 0}</div>
//             <p className="text-xs text-muted-foreground">Registered</p>
//           </CardContent>
//         </Card>

//         <Card className="border-l-4 border-l-secondary shadow-soft">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Sports</CardTitle>
//             <Trophy className="h-4 w-4 text-secondary" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.total_sports || 0}</div>
//             <p className="text-xs text-muted-foreground">Active categories</p>
//           </CardContent>
//         </Card>

//         <Card className="border-l-4 border-l-destructive shadow-soft">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Verified Institutions</CardTitle>
//             <HandHeart className="h-4 w-4 text-destructive" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.verified_institutions || 0}</div>
//             <p className="text-xs text-muted-foreground">Verified</p>
//           </CardContent>
//         </Card>

//         <Card className="border-l-4 border-l-success shadow-soft">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
//             <CreditCard className="h-4 w-4 text-success" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">₹{(stats.total_payments || 0).toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">Total collected</p>
//           </CardContent>
//         </Card>

//         <Card 
//           className="border-l-4 border-l-warning shadow-soft cursor-pointer hover:shadow-md transition-shadow"
//           onClick={handlePendingPaymentsClick}
//         >
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
//             <Clock className="h-4 w-4 text-warning" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.pending_payments || 0}</div>
//             <p className="text-xs text-muted-foreground">Click to filter</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Search and Filter Bar */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//           <Input
//             placeholder="Search institutions..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Select value={selectedSport} onValueChange={setSelectedSport}>
//           <SelectTrigger className="w-full sm:w-48">
//             <SelectValue placeholder="All Sports" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Sports</SelectItem>
//             <SelectItem value="football">Football</SelectItem>
//             <SelectItem value="basketball">Basketball</SelectItem>
//             <SelectItem value="cricket">Cricket</SelectItem>
//             <SelectItem value="tennis">Tennis</SelectItem>
//             <SelectItem value="badminton">Badminton</SelectItem>
//           </SelectContent>
//         </Select>
//         <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
//           <SelectTrigger className="w-full sm:w-48">
//             <SelectValue placeholder="All Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Status</SelectItem>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="inactive">Inactive</SelectItem>
//             <SelectItem value="verified">Verified</SelectItem>
//             <SelectItem value="pending">Pending</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Institutions List */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-semibold">Institutions</h2>
//           <div className="flex items-center gap-2">
//             <Filter className="h-4 w-4 text-muted-foreground" />
//             <span className="text-sm text-muted-foreground">
//               {institutions.length} institutions
//             </span>
//           </div>
//         </div>

//         {institutionsLoading ? (
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-6 w-6 animate-spin mr-2" />
//             <span className="text-muted-foreground">Loading institutions...</span>
//           </div>
//         ) : institutions.length === 0 ? (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center py-8">
//               <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
//               <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
//               <p className="text-muted-foreground text-center">
//                 {searchTerm || selectedPaymentStatus !== "all" 
//                   ? "Try adjusting your search or filter criteria."
//                   : "No institutions have been registered yet."
//                 }
//               </p>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid gap-4">
//             {(institutions || []).map((institution) => (
//               <Card key={institution.id} className="hover:shadow-md transition-shadow">
//                 <CardContent className="p-6">
//                   <div className="flex items-start justify-between">
//                     <div className="space-y-2 flex-1">
//                       <div className="flex items-center gap-3">
//                         <h3 className="text-lg font-semibold">{institution.name}</h3>
//                         <Badge className={getVerificationStatusColor(institution.verified)}>
//                           {institution.verified ? "Verified" : "Pending"}
//                         </Badge>
//                         <Badge className={getPaymentStatusColor(institution.payment_status)}>
//                           {institution.status}
//                         </Badge>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
//                         <div>
//                           <span className="font-medium">Contact Person:</span> {institution.contact_person}
//                         </div>
//                         <div>
//                           <span className="font-medium">Email:</span> {institution.email}
//                         </div>
//                         <div>
//                           <span className="font-medium">Type:</span> {institution.type || "N/A"}
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//                         <div>
//                           <span className="font-medium text-muted-foreground">Sports Enrolled:</span> {institution.sports_enrolled}
//                         </div>
//                         <div>
//                           <span className="font-medium text-muted-foreground">Total Amount:</span> ₹{(institution.total_amount || 0).toLocaleString()}
//                         </div>
//                         <div>
//                           <span className="font-medium text-muted-foreground">Paid Amount:</span> ₹{(institution.paid_amount || 0).toLocaleString()}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 ml-4">
//                       <Sheet>
//                         <SheetTrigger asChild>
//                           <Button variant="outline" size="sm">
//                             <Eye className="h-4 w-4 mr-2" />
//                             View
//                           </Button>
//                         </SheetTrigger>
//                         <SheetContent className="w-[400px] sm:w-[540px]">
//                           <SheetHeader>
//                             <SheetTitle>{institution.name}</SheetTitle>
//                             <SheetDescription>
//                               Institution details and management
//                             </SheetDescription>
//                           </SheetHeader>
//                           <div className="space-y-4 mt-6">
//                             <div>
//                               <h4 className="font-medium mb-2">Contact Information</h4>
//                               <div className="space-y-1 text-sm">
//                                 <p><span className="font-medium">Contact Person:</span> {institution.contact_person}</p>
//                                 <p><span className="font-medium">Email:</span> {institution.email}</p>
//                                 <p><span className="font-medium">Phone:</span> {institution.phone || "N/A"}</p>
//                               </div>
//                             </div>
//                             <div>
//                               <h4 className="font-medium mb-2">Status</h4>
//                               <div className="flex gap-2">
//                                 <Badge className={getVerificationStatusColor(institution.verified)}>
//                                   {institution.verified ? "Verified" : "Pending Verification"}
//                                 </Badge>
//                                 <Badge className={getPaymentStatusColor(institution.payment_status)}>
//                                   {institution.payment_status}
//                                 </Badge>
//                               </div>
//                             </div>
//                             <div>
//                               <h4 className="font-medium mb-2">Financial Information</h4>
//                               <div className="space-y-1 text-sm">
//                                 <p><span className="font-medium">Total Amount:</span> ₹{(institution.total_amount || 0).toLocaleString()}</p>
//                                 <p><span className="font-medium">Paid Amount:</span> ₹{(institution.paid_amount || 0).toLocaleString()}</p>
//                                 <p><span className="font-medium">Pending Amount:</span> ₹{((institution.total_amount || 0) - (institution.paid_amount || 0)).toLocaleString()}</p>
//                               </div>
//                             </div>
//                           </div>
//                         </SheetContent>
//                       </Sheet>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Users, CreditCard, HandHeart, Trophy, Clock, Search, Filter, Eye, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitutionType, setSelectedInstitutionType] = useState("all");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [institutionTypes, setInstitutionTypes] = useState<any[]>([]);
  const [institutionDetails, setInstitutionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // State for API data
  const [stats, setStats] = useState({
    total_institutions: 0,
    active_institutions: 0,
    verified_institutions: 0,
    total_students: 0,
    total_sports: 0,
    total_sponsorships: 0,
    total_payments: 0,
    pending_payments: 0,
  });
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInstitutions, setTotalInstitutions] = useState(0);
  const [institutionsPerPage] = useState(10);
  {console.log("djkdjdjddjdjkdjkdjjkdjkdjkjdjkddjkdjkkd",institutions)}
  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      console.log('Fetching admin dashboard stats...');
      const response = await apiService.getAdminDashboardStats();
      console.log('Dashboard stats response:', response);
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        if (data.success && data.data) {
          setStats(data.data as typeof stats);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    }
  };

  // Fetch institution types
  const fetchInstitutionTypes = async () => {
    try {
      console.log('Fetching institution types...');
      const response = await apiService.getAdminInstitutionTypes();
      console.log('Institution types response:', response);
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        setInstitutionTypes(data.data.institution_types || []);
      }
    } catch (error) {
      console.error('Error fetching institution types:', error);
    }
  };

  // Fetch institutions
  const fetchInstitutions = async (page: number = currentPage) => {
    setInstitutionsLoading(true);
    try {
      console.log('Fetching admin institutions...');
      const skip = (page - 1) * institutionsPerPage;
      const response = await apiService.getAdminInstitutions({
        search: searchTerm || undefined,
        institution_type: selectedInstitutionType !== "all" ? selectedInstitutionType : undefined,
        skip: skip,
        limit: institutionsPerPage
      });
      console.log('Institutions response:', response);
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        setInstitutions(data.data.institutions || []);
        setTotalInstitutions(data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch institutions",
        variant: "destructive",
      });
    } finally {
      setInstitutionsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStats(), fetchInstitutionTypes(), fetchInstitutions()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Refetch institutions when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchInstitutions(1);
  }, [searchTerm, selectedInstitutionType]);

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

  // Handle institution view click
  const handleInstitutionView = (institution: any) => {
    setSelectedInstitution(institution);
    fetchInstitutionDetails(institution.id);
  };

  const handlePendingPaymentsClick = () => {
    setShowPendingOnly(!showPendingOnly);
    // This is just for visual feedback, no actual filtering implemented yet
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
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>


      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-primary shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_institutions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_institutions || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sports</CardTitle>
            <Trophy className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_sports || 0}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Institutions</CardTitle>
            <HandHeart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified_institutions || 0}</div>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.total_payments || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total collected</p>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-warning shadow-soft cursor-pointer hover:shadow-md transition-shadow"
          onClick={handlePendingPaymentsClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_payments || 0}</div>
            <p className="text-xs text-muted-foreground">Click to filter</p>
          </CardContent>
        </Card>
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
      </div>

      {/* Institutions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Institutions</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {totalInstitutions} institutions
            </span>
          </div>
        </div>

        {institutionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading institutions...</span>
          </div>
        ) : institutions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedInstitutionType !== "all" 
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
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{institution.name}</h3>
                        <Badge className={getVerificationStatusColor(institution.verified)}>
                          {institution.verified ? "Verified" : "Pending"}
                        </Badge>
                        <Badge className={getPaymentStatusColor(institution.payment_status)}>
                          {institution.status}
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
                          <span className="font-medium">Type:</span> {institution.type || "N/A"}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Sports Enrolled:</span> {institution.sports_enrolled}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Total Amount:</span> ₹{(institution.total_amount || 0).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Paid Amount:</span> ₹{(institution.paid_amount || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleInstitutionView(institution)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedInstitution?.name || institution.name}</DialogTitle>
                            <DialogDescription>
                              Institution details and management
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 mt-6 max-h-[70vh] overflow-y-auto">
                            {loadingDetails ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span className="text-muted-foreground">Loading details...</span>
                              </div>
                            ) : institutionDetails ? (
                              <>
                                {/* Contact Information */}
                                <div>
                                  <h4 className="font-medium mb-3 text-lg">Contact Information</h4>
                                  <div className="space-y-2">
                                    <p><span className="font-medium">Email:</span> {institutionDetails.email || "N/A"}</p>
                                    <p><span className="font-medium">Type:</span> {institutionDetails.type}</p>
                                    {institutionDetails.contact_persons && institutionDetails.contact_persons.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="font-medium">Contact Persons:</p>
                                        {institutionDetails.contact_persons.map((contact: any, index: number) => (
                                          <div key={index} className="ml-4 p-3 bg-gray-50 rounded-lg">
                                            <p><span className="font-medium">Name:</span> {contact.name}</p>
                                            <p><span className="font-medium">Designation:</span> {contact.designation}</p>
                                            <p><span className="font-medium">Phone:</span> {contact.phone}</p>
                                            <p><span className="font-medium">Email:</span> {contact.email}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
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
                                          <p><span className="font-medium">Gender:</span> {student.gender}</p>
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
                        </DialogContent>
                      </Dialog>
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
                    // Show first page, last page, current page, and pages around current page
                    return page === 1 || 
                           page === Math.ceil(totalInstitutions / institutionsPerPage) || 
                           Math.abs(page - currentPage) <= 2;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
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

export default AdminDashboard;