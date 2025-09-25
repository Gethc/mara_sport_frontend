import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Receipt, 
  Gift, 
  CheckCircle, 
  Clock, 
  XCircle,
  Smartphone,
  University,
  Wallet,
  Eye
} from "lucide-react";

interface PaymentItem {
  id: number;
  sport: string;
  category: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  transactionId?: string;
}

interface SponsorshipRequest {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  sport: string;
  reason?: string;
  sponsorName?: string;
  type?: string;
}

const PaymentsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [selectedSponsorship, setSelectedSponsorship] = useState<SponsorshipRequest | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [sponsorshipForm, setSponsorshipForm] = useState({
    sponsorName: "",
    sponsorshipAmount: "",
    sponsorshipType: "partial"
  });

  // Mock payment data
  const payments: PaymentItem[] = [
    {
      id: 1,
      sport: "Football",
      category: "Men's Team",
      amount: 150,
      status: 'paid',
      dueDate: '2024-02-15',
      transactionId: 'TXN001234567'
    },
    {
      id: 2,
      sport: "Basketball",
      category: "Men's Team",
      amount: 120,
      status: 'pending',
      dueDate: '2024-02-20'
    },
    {
      id: 3,
      sport: "Tennis",
      category: "Singles",
      amount: 80,
      status: 'paid',
      dueDate: '2024-02-18',
      transactionId: 'TXN001234568'
    }
  ];

  const sponsorshipRequests: SponsorshipRequest[] = [
    { 
      id: 1, 
      amount: 100, 
      status: 'pending', 
      requestDate: '2024-02-10', 
      sport: 'Basketball',
      sponsorName: 'Local Business Corp',
      type: 'partial'
    },
    { 
      id: 2, 
      amount: 50, 
      status: 'approved', 
      requestDate: '2024-02-08', 
      sport: 'Tennis',
      sponsorName: 'Sports Foundation',
      type: 'full'
    },
    { 
      id: 3, 
      amount: 75, 
      status: 'rejected', 
      requestDate: '2024-02-05', 
      sport: 'Football',
      reason: 'Insufficient documentation provided',
      sponsorName: 'Community Fund',
      type: 'partial'
    }
  ];

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
  const parentFees = 200; // 2 parents × ₹100 each

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Selection Required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Payment Successful!",
        description: `Successfully paid ₹${totalAmount + parentFees}`,
      });

      setShowPaymentModal(false);
      setPaymentMethod("");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Payment could not be processed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSponsorshipRequest = async () => {
    if (!sponsorshipForm.sponsorName || !sponsorshipForm.sponsorshipAmount) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all required fields for sponsorship request.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Sponsorship Request Submitted",
        description: "Your sponsorship request has been submitted for review.",
      });

      setSponsorshipForm({
        sponsorName: "",
        sponsorshipAmount: "",
        sponsorshipType: "partial"
      });
      setShowSponsorshipModal(false);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit sponsorship request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionPayment = () => {
    toast({
      title: "Request Submitted",
      description: "Institution payment request has been submitted for approval.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'overdue':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return <Badge className="bg-accent text-accent-foreground">{status}</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">{status}</Badge>;
      case 'overdue':
      case 'rejected':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payments & Sponsorship</h1>
        <p className="text-muted-foreground">
          Manage your event payments and sponsorship requests
        </p>
      </div>

      {/* Fee Breakdown - Horizontal Layout */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Fee Breakdown</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Student Registration</span>
            <span className="text-2xl font-bold">₹{totalAmount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Parent Fees (2 parents)</span>
            <span className="text-2xl font-bold">₹{parentFees}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-3xl font-bold text-primary">₹{totalAmount + parentFees}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Payment Status</span>
            <Badge variant={paidAmount >= totalAmount ? "default" : "secondary"} className="w-fit">
              {paidAmount >= totalAmount ? "Completed" : "Pending"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Payment Options - Horizontal Layout */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Payment Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pay Now */}
          <div className="flex items-center justify-between p-4 border rounded-lg border-l-4 border-l-primary">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Pay Now</h3>
                <p className="text-sm text-muted-foreground">₹{totalAmount + parentFees}</p>
              </div>
            </div>
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">Pay Now</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Complete Payment</DialogTitle>
                  <DialogDescription>
                    Total amount: ₹{totalAmount + parentFees}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Payment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Student Fees:</span>
                        <span>₹{totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parent Fees:</span>
                        <span>₹{parentFees}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total:</span>
                        <span>₹{totalAmount + parentFees}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Select Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="mpaisa" id="mpaisa" />
                        <Smartphone className="h-4 w-4 text-primary" />
                        <Label htmlFor="mpaisa" className="flex-1 cursor-pointer">
                          Mpaisa / Mobile Wallet
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <CreditCard className="h-4 w-4 text-primary" />
                        <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                          Razorpay (Card/UPI/NetBanking)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <University className="h-4 w-4 text-primary" />
                        <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                          Stripe (International Cards)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handlePayment}
                      disabled={loading || !paymentMethod}
                      className="flex-1 bg-gradient-primary"
                    >
                      {loading ? "Processing..." : `Pay ₹${totalAmount + parentFees}`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Get Sponsorship */}
          <div className="flex items-center justify-between p-4 border rounded-lg border-l-4 border-l-accent">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Gift className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Get Sponsorship</h3>
                <p className="text-sm text-muted-foreground">Partial/Full</p>
              </div>
            </div>
            <Dialog open={showSponsorshipModal} onOpenChange={setShowSponsorshipModal}>
              <DialogTrigger asChild>
                <Button variant="outline">Apply for Sponsorship</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply for Sponsorship</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your sponsorship request
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sponsorName">Sponsor Name</Label>
                    <Input
                      id="sponsorName"
                      value={sponsorshipForm.sponsorName}
                      onChange={(e) => setSponsorshipForm({...sponsorshipForm, sponsorName: e.target.value})}
                      placeholder="Enter sponsor name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sponsorshipAmount">Sponsorship Amount (₹)</Label>
                    <Input
                      id="sponsorshipAmount"
                      type="number"
                      value={sponsorshipForm.sponsorshipAmount}
                      onChange={(e) => setSponsorshipForm({...sponsorshipForm, sponsorshipAmount: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sponsorshipType">Sponsorship Type</Label>
                    <Select 
                      value={sponsorshipForm.sponsorshipType} 
                      onValueChange={(value) => setSponsorshipForm({...sponsorshipForm, sponsorshipType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSponsorshipModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSponsorshipRequest}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Paid by Institution */}
          <div className="flex items-center justify-between p-4 border rounded-lg border-l-4 border-l-warning">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <University className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Paid by Institution</h3>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleInstitutionPayment}>
              Mark as Institution Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Status Section */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Sport</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Due Date</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="py-3">{payment.sport}</td>
                  <td className="py-3">{payment.category}</td>
                  <td className="py-3">₹{payment.amount}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      {getStatusBadge(payment.status)}
                    </div>
                  </td>
                  <td className="py-3">{payment.dueDate}</td>
                  <td className="py-3">
                    <Dialog open={showViewModal && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                      setShowViewModal(open);
                      if (!open) setSelectedPayment(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Payment Details</DialogTitle>
                        </DialogHeader>
                        {selectedPayment && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground">Sport:</span>
                                <p className="font-medium">{selectedPayment.sport}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Category:</span>
                                <p className="font-medium">{selectedPayment.category}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Amount:</span>
                                <p className="font-medium">₹{selectedPayment.amount}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Status:</span>
                                {getStatusBadge(selectedPayment.status)}
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Due Date:</span>
                                <p className="font-medium">{selectedPayment.dueDate}</p>
                              </div>
                              {selectedPayment.transactionId && (
                                <div>
                                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                                  <p className="font-medium">{selectedPayment.transactionId}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sponsorship Status Section */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Wallet className="h-5 w-5 text-warning" />
          <h2 className="text-xl font-semibold">Sponsorship Status</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Sport</th>
                <th className="text-left py-2">Sponsor</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsorshipRequests.map((request) => (
                <tr key={request.id} className="border-b">
                  <td className="py-3">{request.sport}</td>
                  <td className="py-3">{request.sponsorName || 'N/A'}</td>
                  <td className="py-3">₹{request.amount}</td>
                  <td className="py-3 capitalize">{request.type}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)}
                    </div>
                  </td>
                  <td className="py-3">{request.requestDate}</td>
                  <td className="py-3">
                    <Dialog open={showViewModal && selectedSponsorship?.id === request.id} onOpenChange={(open) => {
                      setShowViewModal(open);
                      if (!open) setSelectedSponsorship(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSponsorship(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Sponsorship Details</DialogTitle>
                        </DialogHeader>
                        {selectedSponsorship && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground">Sport:</span>
                                <p className="font-medium">{selectedSponsorship.sport}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Sponsor:</span>
                                <p className="font-medium">{selectedSponsorship.sponsorName || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Amount:</span>
                                <p className="font-medium">₹{selectedSponsorship.amount}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Type:</span>
                                <p className="font-medium capitalize">{selectedSponsorship.type}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Status:</span>
                                {getStatusBadge(selectedSponsorship.status)}
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Request Date:</span>
                                <p className="font-medium">{selectedSponsorship.requestDate}</p>
                              </div>
                            </div>
                            {selectedSponsorship.reason && (
                              <div>
                                <span className="text-sm text-muted-foreground">Reason:</span>
                                <p className="font-medium mt-1">{selectedSponsorship.reason}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;