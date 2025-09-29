import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const StudentPaymentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
    bankName: ""
  });

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      
      const response = await apiService.getStudentPaymentInfo(parseInt(studentId));
      const studentData = (response.data as any)?.data;
      
      if (studentData) {
        setStudent(studentData);
      } else {
        throw new Error('No student data received');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!student) return;

    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      const paymentData = {
        status: "Paid",
        amount: student.total_amount,
        method: paymentMethod === "online" ? "Credit Card" : "UPI"
      };

      // In a real implementation, you'd call the payment API here
      // await apiService.processStudentPayment(student.id, paymentData);

      toast({
        title: "Payment Successful",
        description: `Payment of ₹${student.total_amount} processed successfully`,
      });

      // Redirect to success page or student dashboard
      navigate("/student-dashboard");
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p>Student not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Student Payment Portal</h1>
          <p className="text-gray-600 mt-2">Complete your sports registration payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Student Name</Label>
                <p className="text-lg font-semibold">
                  {student.fname} {student.mname} {student.lname}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Student ID</Label>
                <p className="text-lg">{student.student_id}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-lg">{student.email}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                <div className="mt-1">
                  <Badge className={student.payment_status === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {student.payment_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">₹{student.total_amount}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Paid Amount</span>
                  <span className="text-sm">₹{student.paid_amount}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Balance</span>
                  <span className="text-sm font-medium">₹{student.total_amount - student.paid_amount}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Payment Method</Label>
                
                <div className="space-y-3">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "online" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("online")}
                  >
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3" />
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "upi" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 mr-3" />
                      <span className="font-medium">UPI Payment</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              {paymentMethod === "online" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@paytm"
                      value={paymentData.upiId}
                      onChange={(e) => setPaymentData({...paymentData, upiId: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <Button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pay ₹{student.total_amount - student.paid_amount}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentPage;
