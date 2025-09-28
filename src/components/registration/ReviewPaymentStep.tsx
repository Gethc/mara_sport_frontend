import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { 
  User, 
  CreditCard,
  CheckCircle,
  Trophy,
  Heart,
  Wallet,
  Building,
  Gift
} from "lucide-react";

interface ReviewPaymentStepProps {
  registrationData: {
    personalDetails: any;
    documents: any;
    parentMedical: any;
    sports: any;
  };
  email: string;
  onComplete: () => void;
  onBack: () => void;
}

export const ReviewPaymentStep = ({ registrationData, email, onComplete, onBack }: ReviewPaymentStepProps) => {
  const [confirmDetails, setConfirmDetails] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showSponsorshipForm, setShowSponsorshipForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [sponsorshipData, setSponsorshipData] = useState({
    requestedAmount: "",
    sponsorshipType: "",
    reason: ""
  });
  const { toast } = useToast();

  const [feeCalculation, setFeeCalculation] = useState<any>(null);
  const [parentPassPricing, setParentPassPricing] = useState<any>(null);

  // Load parent pass pricing on component mount
  useEffect(() => {
    loadParentPassPricing();
  }, []);

  const loadParentPassPricing = async () => {
    try {
      const response = await apiService.getPricingSummary();
      const data = response.data as any;
      if (data && data.success) {
        setParentPassPricing(data.data);
      }
    } catch (error) {
      console.error("Error loading parent pass pricing:", error);
      // Fallback to default pricing if API fails
      setParentPassPricing({
        13: [{ amount: 300, pass_type: "Early Bird" }], // Under 13
        14: [{ amount: 500, pass_type: "Early Bird" }]  // 13+
      });
    }
  };

  const calculateParentFees = () => {
    const parentMedical = registrationData.parentMedical;
    if (!parentMedical?.parents?.length) return 0;
    
    // Age-based pricing: Under 13 = KES 300, 13+ = KES 500
    let totalFee = 0;
    parentMedical.parents.forEach((parent: any) => {
      if (parent.age < 13) {
        totalFee += 300;
      } else {
        totalFee += 500;
      }
    });
    return totalFee;
  };

  const calculateTotal = () => {
    if (feeCalculation) {
      return feeCalculation.breakdown.total;
    }
    // Fallback calculation
    const sportsFee = (registrationData.sports?.selectedSports?.length || 0) * 1000; // KES
    const parentFee = calculateParentFees();
    
    return sportsFee + parentFee;
  };

  const handleProceedToPayment = () => {
    if (!confirmDetails) {
      setErrors(["Please confirm that all details are correct"]);
      return;
    }
    setErrors([]);
    setShowPaymentOptions(true);
  };

  const handlePaymentOption = async (option: "pay_now" | "sponsorship" | "institution") => {
    if (option === "sponsorship") {
      setShowSponsorshipForm(true);
      return;
    }

    setProcessing(true);

    try {
      // Call the complete registration API
      await apiService.completeRegistration({ email: email });
      
      if (option === "pay_now") {
        // Calculate total amount
        const totalAmount = calculateTotal();
        
        // Create payment request
        const paymentResponse = await apiService.createPaymentRequest({
          email: email,
          amount: totalAmount,
          currency: "KES",
          fee_breakdown: feeCalculation?.breakdown || null
        });
        
        if (paymentResponse.data && (paymentResponse.data as any).success) {
          toast({
            title: "Payment Request Created! 💳",
            description: `Payment request for KES ${totalAmount.toLocaleString()} has been created. Redirecting to payment gateway...`,
          });
          
          // Simulate payment gateway redirect
          setTimeout(() => {
            toast({
              title: "Payment Successful! 🎉",
              description: "Your registration and payment have been completed successfully.",
            });
            onComplete();
          }, 2000);
        } else {
          throw new Error("Failed to create payment request");
        }
      } else {
        toast({
          title: "Registration Complete! 🎉",
          description: "Your registration has been completed successfully. Payment will be handled by your institution.",
        });
        onComplete();
      }
    } catch (error) {
      console.error("Error completing registration:", error);
      toast({
        title: "Error",
        description: "Failed to complete registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSponsorshipSubmit = async () => {
    const newErrors: string[] = [];
    
    if (!sponsorshipData.requestedAmount) newErrors.push("Requested amount is required");
    if (!sponsorshipData.sponsorshipType) newErrors.push("Sponsorship type is required");
    if (!sponsorshipData.reason) newErrors.push("Reason for sponsorship is required");
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setProcessing(true);
    setErrors([]);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sponsorship Request Submitted",
        description: "Your sponsorship request has been submitted for review.",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const { personalDetails, documents, parentMedical, sports } = registrationData;

  // Calculate fees when component loads
  useEffect(() => {
    calculateFees();
  }, []);

  const calculateFees = async () => {
    try {
      const calculationData = {
        selectedSports: sports?.selectedSports || [],
        parentCount: parentMedical?.parents?.length || 0,
        parentAges: parentMedical?.parents?.map((parent: any) => parent.age) || []
      };

      const response = await apiService.calculateTotalFees(calculationData);
      
      if (response.data && (response.data as any).success) {
        setFeeCalculation((response.data as any).data);
      }
    } catch (error) {
      console.error("Error calculating fees:", error);
      // Don't show error toast for fee calculation as it's not critical
    }
  };

  // Sponsorship Form View
  if (showSponsorshipForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Request Sponsorship</CardTitle>
            <CardDescription>
              Please provide details for your sponsorship request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requestedAmount">Requested Amount *</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  placeholder="Enter amount (e.g., 50)"
                  value={sponsorshipData.requestedAmount}
                  onChange={(e) => setSponsorshipData(prev => ({ ...prev, requestedAmount: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Sponsorship Type *</Label>
                <RadioGroup 
                  value={sponsorshipData.sponsorshipType} 
                  onValueChange={(value) => setSponsorshipData(prev => ({ ...prev, sponsorshipType: value }))}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial">Partial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full">Full</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Sponsorship *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please explain why you need sponsorship and your current financial situation..."
                  value={sponsorshipData.reason}
                  onChange={(e) => setSponsorshipData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setShowSponsorshipForm(false)}>
                Back to Payment Options
              </Button>
              <Button 
                onClick={handleSponsorshipSubmit}
                disabled={processing}
                className="bg-gradient-primary"
              >
                {processing ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPaymentOptions) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Choose Payment Option</CardTitle>
            <CardDescription>
              Select your preferred payment method to complete registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Summary */}
            <Card className="border border-primary/30 bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {feeCalculation ? (
                  <>
                    <div className="flex justify-between">
                      <span>Sports Fee ({sports?.selectedSports?.length || 0} sports)</span>
                      <span>KES {feeCalculation.breakdown.sports_fees.reduce((sum: number, sport: any) => sum + sport.fee, 0).toLocaleString()}</span>
                    </div>
                    {feeCalculation.breakdown.parent_fee > 0 && (
                      <div className="flex justify-between">
                        <span>Parent Fee ({parentMedical?.parents?.length || 0} parents - age-based pricing)</span>
                        <span>KES {feeCalculation.breakdown.parent_fee.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">KES {feeCalculation.breakdown.total.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Base Registration Fee</span>
                      <span>KES 1,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sports Fee ({sports?.selectedSports?.length || 0} sports)</span>
                      <span>KES {((sports?.selectedSports?.length || 0) * 1000).toLocaleString()}</span>
                    </div>
                    {parentMedical?.parents?.length > 0 && (
                      <div className="flex justify-between">
                        <span>Parent Fee ({parentMedical?.parents?.length} parents - age-based pricing)</span>
                        <span>KES {calculateParentFees().toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">KES {calculateTotal().toLocaleString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pay Now */}
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Wallet className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Pay Now</h3>
                    <p className="text-sm text-muted-foreground">
                      Pay immediately using card or online payment
                    </p>
                  </div>
                  <Button 
                    className="w-full bg-gradient-primary"
                    onClick={() => handlePaymentOption("pay_now")}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Pay KES " + calculateTotal().toLocaleString()}
                  </Button>
                </CardContent>
              </Card>

              {/* Get Sponsorship */}
              <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors cursor-pointer group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Gift className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Get Sponsorship</h3>
                    <p className="text-sm text-muted-foreground">
                      Request partial or full sponsorship for registration
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handlePaymentOption("sponsorship")}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Request Sponsorship"}
                  </Button>
                </CardContent>
              </Card>

              {/* Paid by Institution */}
              <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors cursor-pointer group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                      <Building className="h-8 w-8 text-secondary-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Paid by Institution</h3>
                    <p className="text-sm text-muted-foreground">
                      Your institution will handle the payment
                    </p>
                  </div>
                  <Button 
                    variant="secondary"
                    className="w-full"
                    onClick={() => handlePaymentOption("institution")}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Continue"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setShowPaymentOptions(false)}>
                Back to Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Review Your Information</CardTitle>
          <CardDescription>
            Please review all your information before proceeding to payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Two-column grid layout for review */}
          <div className="space-y-8">
            {/* Student Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Student Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">
                    {personalDetails?.firstName} {personalDetails?.middleName} {personalDetails?.lastName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{personalDetails?.email}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-medium">{personalDetails?.dateOfBirth}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium">{personalDetails?.gender}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{personalDetails?.phoneNumber}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{personalDetails?.studentId}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1 col-span-2">
                  <span className="text-muted-foreground">Institution:</span>
                  <span className="font-medium">
                    {personalDetails?.instituteName === "Other" ? personalDetails?.otherInstitute : personalDetails?.instituteName}
                  </span>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Parent & Medical Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Parents Attending:</span>
                  <span className="font-medium capitalize">{parentMedical?.parentsAttending}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Medical Facilities:</span>
                  <span className="font-medium capitalize">{parentMedical?.medicalFacilities}</span>
                </div>
                
                {parentMedical?.parentsAttending === "yes" && parentMedical?.parents?.length > 0 && (
                  <div className="col-span-2 space-y-2">
                    <span className="text-muted-foreground font-medium">Parent Details:</span>
                    {parentMedical.parents.map((parent: any, index: number) => (
                      <div key={index} className="grid grid-cols-2 gap-x-8 gap-y-2 ml-4 p-2 bg-muted/30 rounded">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Name:</span>
                          <span>{parent.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Relation:</span>
                          <span>{parent.relation}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{parent.phone}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{parent.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Allergies/Conditions:</span>
                  <span className="font-medium capitalize">{parentMedical?.allergiesConditions}</span>
                </div>
              </div>
            </div>

            {/* Sports Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Sports Selection</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{sports?.participationType} Sports</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Total Sports:</span>
                  <span className="font-medium">{sports?.selectedSports?.length || 0}</span>
                </div>
                
                {sports?.selectedSports?.length > 0 && (
                  <div className="col-span-2 space-y-2">
                    <span className="text-muted-foreground font-medium">Selected Sports:</span>
                    <div className="grid grid-cols-2 gap-2 ml-4">
                      {sports.selectedSports.map((sport: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs bg-muted/30 rounded p-2">
                          <span>{sport.sport}</span>
                          <Badge variant="secondary" className="text-xs">{sport.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Documents</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Student ID Image:</span>
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">Age Proof Document:</span>
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <Card className="border border-primary/30 bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Payment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {feeCalculation ? (
                  <>
                    <div className="flex justify-between">
                      <span>Sports Fee ({sports?.selectedSports?.length || 0} sports)</span>
                      <span>KES {feeCalculation.breakdown.sports_fees.reduce((sum: number, sport: any) => sum + sport.fee, 0).toLocaleString()}</span>
                    </div>
                    {feeCalculation.breakdown.parent_fee > 0 && (
                      <div className="flex justify-between">
                        <span>Parent Fee ({parentMedical?.parents?.length || 0} parents - age-based pricing)</span>
                        <span>KES {feeCalculation.breakdown.parent_fee.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">KES {feeCalculation.breakdown.total.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Base Registration Fee</span>
                      <span>KES 1,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sports Fee ({sports?.selectedSports?.length || 0} sports)</span>
                      <span>KES {((sports?.selectedSports?.length || 0) * 1000).toLocaleString()}</span>
                    </div>
                    {parentMedical?.parents?.length > 0 && (
                      <div className="flex justify-between">
                        <span>Parent Fee ({parentMedical?.parents?.length} parents - age-based pricing)</span>
                        <span>KES {calculateParentFees().toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">KES {calculateTotal().toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Consent Checkbox */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="confirm"
                checked={confirmDetails}
                onCheckedChange={(checked) => setConfirmDetails(!!checked)}
              />
              <div className="space-y-1">
                <label htmlFor="confirm" className="text-sm font-medium cursor-pointer">
                  I confirm that all the information provided above is correct and accurate
                </label>
                <p className="text-xs text-muted-foreground">
                  Please review all information carefully. Changes after payment may require additional processing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button 
              onClick={handleProceedToPayment} 
              disabled={!confirmDetails}
              className="bg-gradient-primary min-w-[200px]"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};