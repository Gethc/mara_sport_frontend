import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, ChevronLeft, ChevronRight, DollarSign, Users, Building2, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface Payment {
  id: number;
  type: 'student' | 'institute';
  amount: number;
  status: number;
  status_text: string;
  student?: {
    id: number;
    name: string;
    email: string;
    student_id: string;
  };
  institute?: {
    id: number;
    name: string;
    type: string;
  };
  created_at: string;
  updated_at: string;
}

interface PaymentSummary {
  student_payments: {
    total: number;
    pending: number;
    completed: number;
    pending_amount: number;
    completed_amount: number;
  };
  institute_payments: {
    total: number;
    pending: number;
    completed: number;
    pending_amount: number;
    completed_amount: number;
  };
  overall: {
    total_payments: number;
    total_pending: number;
    total_completed: number;
    total_pending_amount: number;
    total_completed_amount: number;
  };
}


const AdminPayments: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [filters, setFilters] = useState({
    status_filter: '',
    type_filter: '',
    search: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });

  // Sorting
  const [sorting, setSorting] = useState({
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  useEffect(() => {
    loadData();
  }, [filters, pagination.page, pagination.limit, sorting]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading payments data...');
      console.log('Filters:', filters);
      console.log('Pagination:', pagination);
      console.log('Sorting:', sorting);
      
      // Load payments and summary in parallel
      const [paymentsResponse, summaryResponse] = await Promise.all([
        apiService.getAdminPayments({
          status_filter: filters.status_filter || undefined,
          type_filter: filters.type_filter || undefined,
          search: filters.search || undefined,
          page: pagination.page,
          limit: pagination.limit,
          sort_by: sorting.sort_by,
          sort_order: sorting.sort_order
        }),
        apiService.getPaymentsSummary()
      ]);

      console.log('Payments Response:', paymentsResponse);
      console.log('Summary Response:', summaryResponse);

      if ((paymentsResponse.data as any)?.success) {
        const paymentsData = (paymentsResponse.data as any).data;
        console.log('Payments data:', paymentsData);
        setPayments(paymentsData.payments || []);
        setPagination(prev => ({
          ...prev,
          ...paymentsData.pagination
        }));
      } else {
        console.error('Payments API failed:', paymentsResponse.data);
        // Set empty data if API fails
        setPayments([]);
      }

      if ((summaryResponse.data as any)?.success) {
        setSummary((summaryResponse.data as any).data);
      } else {
        console.error('Summary API failed:', summaryResponse.data);
        // Set empty summary if API fails
        setSummary({
          student_payments: { total: 0, pending: 0, completed: 0, pending_amount: 0, completed_amount: 0 },
          institute_payments: { total: 0, pending: 0, completed: 0, pending_amount: 0, completed_amount: 0 },
          overall: { total_payments: 0, total_pending: 0, total_completed: 0, total_pending_amount: 0, total_completed_amount: 0 }
        });
      }

    } catch (error) {
      console.error('Error loading payments data:', error);
      toast({
        title: "Error",
        description: "Failed to load payments data. Please check if the server is running.",
        variant: "destructive",
      });
      // Set empty data on error
      setPayments([]);
      setSummary({
        student_payments: { total: 0, pending: 0, completed: 0, pending_amount: 0, completed_amount: 0 },
        institute_payments: { total: 0, pending: 0, completed: 0, pending_amount: 0, completed_amount: 0 },
        overall: { total_payments: 0, total_pending: 0, total_completed: 0, total_pending_amount: 0, total_completed_amount: 0 }
      });
    } finally {
      setLoading(false);
    }
  };


  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" values to empty strings for API compatibility
    const filterValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: string) => {
    const newOrder = sorting.sort_by === field && sorting.sort_order === 'asc' ? 'desc' : 'asc';
    setSorting({ sort_by: field, sort_order: newOrder });
  };


  const handlePaymentClick = (payment: Payment) => {
    navigate(`/admin/payment-details/${payment.type}/${payment.id}`);
  };

  const handleExport = async () => {
    try {
      const response = await apiService.exportPayments();

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'payments_export.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Payments data exported successfully!",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export payments data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: number, statusText: string) => {
    if (status === 1) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{statusText}</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />{statusText}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    if (type === 'student') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Users className="w-3 h-3 mr-1" />Student</Badge>;
    }
    return <Badge variant="outline" className="bg-purple-50 text-purple-700"><Building2 className="w-3 h-3 mr-1" />Institution</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="ml-2">Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments Management</h1>
          <p className="text-muted-foreground">Manage and monitor all payment transactions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.overall.total_payments}</div>
              <p className="text-xs text-muted-foreground">
                {summary.overall.total_completed} completed, {summary.overall.total_pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.overall.total_completed_amount + summary.overall.total_pending_amount)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.overall.total_completed_amount)} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Student Payments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.student_payments.total}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.student_payments.completed_amount)} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Institution Payments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.institute_payments.total}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.institute_payments.completed_amount)} completed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or ID..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>


            {/* Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={filters.type_filter || "all"} onValueChange={(value) => handleFilterChange('type_filter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="institute">Institution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status_filter || "all"} onValueChange={(value) => handleFilterChange('status_filter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Entries - Horizontal Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Entries</CardTitle>
          <CardDescription>
            Showing {payments.length} of {pagination.total} payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={`${payment.type}-${payment.id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handlePaymentClick(payment)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getTypeBadge(payment.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-lg">
                      {payment.type === 'institute' && payment.institute
                        ? payment.institute.name
                        : payment.type === 'student' && payment.student
                        ? payment.student.name
                        : 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.type === 'institute' && payment.institute
                        ? payment.institute.type
                        : payment.type === 'student' && payment.student
                        ? payment.student.email
                        : 'No details available'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-lg">{formatCurrency(payment.amount)}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</div>
                  </div>
                  <div>
                    {getStatusBadge(payment.status, payment.status_text)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.has_prev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.has_next}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminPayments;