import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Building2, Clock, CheckCircle, DollarSign } from 'lucide-react';
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

interface StudentEnrollment {
  id: number;
  name: string;
  institution_name: string;
  age: number;
  email: string;
  phone: string;
  student_id: string;
  sport: string;
  fee: number;
  // Additional fields for student sports enrollments
  category?: string;
  sub_category?: string;
  age_group?: string;
  is_active?: boolean;
}

const PaymentDetailsPage: React.FC = () => {
  const { paymentId, paymentType } = useParams<{ paymentId: string; paymentType: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId && paymentType) {
      loadPaymentDetails();
    }
  }, [paymentId, paymentType]);

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);
      
      console.log('Loading payment details for:', paymentType, paymentId);
      
      const response = await apiService.getPaymentDetails(paymentType || '', parseInt(paymentId || '0'));
      
      console.log('Payment details response:', response);
      
      if (response.data?.success) {
        const data = response.data.data;
        setPayment(data.payment);
        setStudentEnrollments(data.student_enrollments || []);
      } else {
        console.error('Failed to load payment details:', response.data);
        toast({
          title: "Error",
          description: response.data?.message || "Failed to load payment details",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error loading payment details:', error);
      toast({
        title: "Error",
        description: "Failed to load payment details. Please check if the server is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!payment || !paymentId || !paymentType) {
      toast({
        title: "Error",
        description: "Missing payment information",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiService.updatePaymentStatus(
        paymentType,
        parseInt(paymentId),
        "paid"
      );
      
      if (response.data?.success) {
        toast({
          title: "Success",
          description: "Payment status updated to paid successfully",
        });
        
        // Update the local payment state
        setPayment(prev => prev ? {
          ...prev,
          status: 1,
          status_text: "Paid"
        } : null);
        
        // Reload payment details to get updated data
        await loadPaymentDetails();
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to update payment status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Payment not found</p>
        <Button onClick={() => navigate('/admin/admin-payments')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/admin/admin-payments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {payment.type === 'institute' ? 'Institution Details' : 'Student Details'}
            </h1>
            <p className="text-muted-foreground">Payment ID: {payment.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getTypeBadge(payment.type)}
          {getStatusBadge(payment.status, payment.status_text)}
        </div>
      </div>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Amount</label>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1 flex items-center gap-2">
                {getStatusBadge(payment.status, payment.status_text)}
                {payment.status === 0 && (
                  <Button
                    onClick={handleMarkAsPaid}
                    disabled={loading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? "Updating..." : "Mark as Paid"}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-lg">{formatDate(payment.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <div className="mt-1">{getTypeBadge(payment.type)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Institution/Student Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {payment.type === 'institute' ? 'Institution Information' : 'Student Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payment.type === 'institute' && payment.institute ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Institution Name</label>
                  <p className="text-xl font-semibold">{payment.institute.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Institution Type</label>
                  <p className="text-lg">{payment.institute.type}</p>
                </div>
              </>
            ) : payment.type === 'student' && payment.student ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Name</label>
                  <p className="text-xl font-semibold">{payment.student.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{payment.student.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                  <p className="text-lg">{payment.student.student_id}</p>
                </div>
              </>
            ) : (
              <p>No details available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditional rendering based on payment type */}
      {payment.type === 'institute' ? (
        /* Students and Sports Enrollment Table - Only for Institution payments */
        <Card>
          <CardHeader>
            <CardTitle>Students and Sports Enrollment</CardTitle>
            <CardDescription>
              Showing {studentEnrollments.length} student enrollments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Institution Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEnrollments.length > 0 ? (
                    studentEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{enrollment.name}</TableCell>
                        <TableCell>{enrollment.institution_name}</TableCell>
                        <TableCell>{enrollment.age}</TableCell>
                        <TableCell>{enrollment.email}</TableCell>
                        <TableCell>{enrollment.phone}</TableCell>
                        <TableCell>{enrollment.student_id}</TableCell>
                        <TableCell>{enrollment.sport}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(enrollment.fee)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        No student enrollment data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Student Sports Enrollments - Only for Student payments */
        <Card>
          <CardHeader>
            <CardTitle>Student Sports Enrollments</CardTitle>
            <CardDescription>
              Sports enrolled by this student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sport</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sub-Category</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEnrollments.length > 0 ? (
                    studentEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{enrollment.sport}</TableCell>
                        <TableCell>{enrollment.category || "N/A"}</TableCell>
                        <TableCell>{enrollment.sub_category || "N/A"}</TableCell>
                        <TableCell>{enrollment.age_group || "N/A"}</TableCell>
                        <TableCell className="font-medium text-green-600">{formatCurrency(enrollment.fee)}</TableCell>
                        <TableCell>
                          <Badge variant={enrollment.is_active ? "default" : "secondary"}>
                            {enrollment.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No sports enrollments found for this student
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentDetailsPage;
