import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Link } from "react-router-dom";
import { 
  Trophy, 
  Bell, 
  Eye,
  DollarSign,
  Gift,
  Loader2,
  AlertCircle
} from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { student } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { toast } = useToast();
  
  // State for API data
  const [registeredSports, setRegisteredSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSports: 0,
    paidSports: 0,
    pendingSports: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  // Fetch student data
  const fetchStudentData = async () => {
    try {
      // Check if student is authenticated
      if (!student) {
        console.log('No student found, redirecting to login...');
        return;
      }

      // Check if auth token exists
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.log('No auth token found, redirecting to login...');
        return;
      }

      console.log('Fetching student dashboard data...');
      // Fetch student dashboard data
      const response = await apiService.getStudentDashboard();
      const dashboardData = (response.data as any)?.data;
      
      if (dashboardData) {
        // Set registrations
        const registrations = dashboardData.registrations || [];
        setRegisteredSports(registrations);
        
        // Set stats from backend
        const backendStats = dashboardData.stats || {};
        setStats({
          totalSports: backendStats.total_sports || 0,
          paidSports: backendStats.paid_sports || 0,
          pendingSports: backendStats.pending_sports || 0,
          totalAmount: backendStats.total_amount || 0,
          paidAmount: backendStats.paid_amount || 0,
          pendingAmount: backendStats.pending_amount || 0,
        });
      } else {
        // Fallback to empty data
        setRegisteredSports([]);
        setStats({
          totalSports: 0,
          paidSports: 0,
          pendingSports: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('422')) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to access your dashboard",
            variant: "destructive",
          });
        } else if (error.message.includes('401')) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to fetch your sports registrations: ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch your sports registrations",
          variant: "destructive",
        });
      }
      
      // Set empty data on error
      setRegisteredSports([]);
      setStats({
        totalSports: 0,
        paidSports: 0,
        pendingSports: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student?.id) {
      fetchStudentData();
    }
  }, [student?.id]);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Unpaid": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSponsorshipStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Applied": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "None": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {student?.fname} {student?.mname} {student?.lname}!
          </h1>
          <p className="text-muted-foreground">
            Student • Student ID: {student?.student_id}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sports</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSports}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Sports</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidSports}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingSports}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Gift className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalAmount}</div>
            <p className="text-xs text-muted-foreground">All registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Register for Sports</CardTitle>
            <CardDescription>
              Browse and register for available sports categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/sports-registration">
                <Trophy className="h-4 w-4 mr-2" />
                View Sports
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
            <CardDescription>
              View and manage your payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard/student-payments">
                <DollarSign className="h-4 w-4 mr-2" />
                View Payments
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Profile Settings</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/profile">
                <Eye className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Registered Sports Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Your Sports Registrations</CardTitle>
              <CardDescription>
                Track your registered sports and payment status
              </CardDescription>
            </div>
            {registeredSports.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{stats.paidSports} Paid</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>{stats.pendingSports} Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Total: ₹{stats.totalAmount}</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {registeredSports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No registrations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't registered for any sports yet. Browse available sports to get started!
              </p>
              <Button asChild>
                <Link to="/sports-registration">
                  <Trophy className="h-4 w-4 mr-2" />
                  Browse Sports
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Sport Name</TableHead>
                    <TableHead className="min-w-[150px]">Category</TableHead>
                    <TableHead className="min-w-[150px]">Sub Category</TableHead>
                    <TableHead className="min-w-[100px]">Age Group</TableHead>
                    <TableHead className="min-w-[120px]">Institute</TableHead>
                    <TableHead className="min-w-[100px]">Fee</TableHead>
                    <TableHead className="min-w-[120px]">Payment Status</TableHead>
                    <TableHead className="min-w-[100px]">Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registeredSports.map((sport) => (
                    <TableRow key={sport.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          {sport.sport_name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {sport.category_name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sport.sub_category_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {sport.age_group || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate" title={sport.institute_name || 'N/A'}>
                          {sport.institute_name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        ₹{sport.fee || 0}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(sport.payment_status)}>
                          {sport.payment_status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sport.registration_date ? new Date(sport.registration_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;