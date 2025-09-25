import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Building, Users, Trophy, Calculator, DollarSign, Mail, HandHeart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface InstitutionPaymentStepProps {
  institutionData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  loading: boolean;
}

const FEE_PER_SPORT = 1000; // Fallback fee if API fails

export const InstitutionPaymentStep = ({ 
  institutionData, 
  onComplete, 
  onBack, 
  loading 
}: InstitutionPaymentStepProps) => {
  const { toast } = useToast();
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<"payNow" | "sponsor" | "payByStudent" | null>(null);
  const [sponsorData, setSponsorData] = useState({
    requestedAmount: "",
    sponsorshipType: "",
    reason: "",
  });
  const [fees, setFees] = useState({
    sportsFee: 0,
    totalFee: 0,
  });
  const [feeCalculation, setFeeCalculation] = useState<any>(null);
  const [loadingFees, setLoadingFees] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Calculate fees using API
  useEffect(() => {
    const calculateFees = async () => {
      try {
        setLoadingFees(true);
        
        // Prepare selected sports data
        const selectedSports = institutionData.sportTeams?.map((team: any) => ({
          sport_id: team.sportId || 1 // Use sportId from team or fallback
        })) || [];
        
        // Calculate parent count (assuming 2 parents per institution for now)
        const parentCount = 2;
        const baseFee = 1000;
        
        if (selectedSports.length > 0) {
          const response = await apiService.calculateTotalFees({
            selectedSports,
            parentCount,
            baseFee
          });
          
          if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            const responseData = response.data as any;
            if (responseData.success && responseData.data) {
              setFeeCalculation(responseData.data);
              
              // Calculate total manually by adding individual fees
              const sportsFee = responseData.data.summary.sports_fee || 0;
              const parentFee = responseData.data.summary.parent_fee || 0;
              const calculatedTotal = sportsFee + parentFee;
              
              setFees({
                sportsFee: sportsFee,
                totalFee: calculatedTotal,
              });
            }
          }
        } else {
          // Fallback calculation if no sports selected
          const sportsFee = 0;
          const totalFee = sportsFee;
          setFees({ sportsFee, totalFee });
        }
      } catch (error) {
        console.error("Failed to calculate fees:", error);
        // Fallback to hardcoded calculation
        const sportsCount = institutionData.sportTeams?.length || 0;
        const sportsFee = sportsCount * FEE_PER_SPORT;
        const totalFee = sportsFee;
        setFees({ sportsFee, totalFee });
        
        toast({
          title: "Fee Calculation Warning",
          description: "Using fallback fee calculation. Please check with support.",
          variant: "destructive",
        });
      } finally {
        setLoadingFees(false);
      }
    };

    calculateFees();
  }, [institutionData, toast]);

  const handlePayNow = () => {
    setProcessing(true);
    // Simulate payment gateway redirect
    setTimeout(() => {
      toast({
        title: "Redirecting to Payment Gateway",
        description: "Please complete your payment to finish registration.",
      });
      onComplete({
        paymentType: "payNow",
        totalFees: fees.totalFee,
        studentsFee: fees.studentsFee,
        sportsFee: fees.sportsFee,
        status: "payment_pending"
      });
    }, 1000);
  };

  const handleSponsorRequest = () => {
    if (!sponsorData.requestedAmount || !sponsorData.sponsorshipType || !sponsorData.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all sponsor request fields.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      toast({
        title: "Sponsorship Request Submitted",
        description: "Your account has been created. We'll review your sponsorship request.",
      });
      onComplete({
        paymentType: "sponsor",
        sponsorshipData: sponsorData,
        totalFees: fees.totalFee,
        status: "sponsorship_requested",
        accountCreated: true
      });
    }, 1000);
  };

  const handlePayByStudent = () => {
    setProcessing(true);
    setTimeout(() => {
      toast({
        title: "Payment Instructions Sent",
        description: "Payment emails have been sent to all registered students.",
      });
      onComplete({
        paymentType: "payByStudent",
        totalFees: fees.totalFee,
        studentsFee: fees.studentsFee,
        sportsFee: fees.sportsFee,
        emailsSent: institutionData.sportTeams 
          ? institutionData.sportTeams.reduce((total: number, team: any) => total + team.students.length, 0)
          : institutionData.students?.length || 0,
        status: "payment_emails_sent",
        accountCreated: true
      });
    }, 1000);
  };

  const renderSponsorForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="h-5 w-5" />
          Sponsorship Request Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="requestedAmount">Requested Amount *</Label>
          <Input
            id="requestedAmount"
            type="number"
            placeholder="Enter amount in ₹"
            value={sponsorData.requestedAmount}
            onChange={(e) => setSponsorData(prev => ({ ...prev, requestedAmount: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Sponsorship Type *</Label>
          <RadioGroup 
            value={sponsorData.sponsorshipType} 
            onValueChange={(value) => setSponsorData(prev => ({ ...prev, sponsorshipType: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Partial" id="partial" />
              <Label htmlFor="partial">Partial Sponsorship</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Full" id="full" />
              <Label htmlFor="full">Full Sponsorship</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Sponsorship *</Label>
          <Textarea
            id="reason"
            placeholder="Please explain why you need sponsorship..."
            value={sponsorData.reason}
            onChange={(e) => setSponsorData(prev => ({ ...prev, reason: e.target.value }))}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSponsorRequest} disabled={processing} className="flex-1">
            {processing ? "Submitting..." : "Save Request & Create Account"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Registration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Registration Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="font-medium">Institution:</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {institutionData.institutionName}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Total Students:</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {institutionData.sportTeams 
                  ? institutionData.sportTeams.reduce((total: number, team: any) => total + team.students.length, 0)
                  : institutionData.students?.length || 0
                }
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">Selected Sports:</span>
            </div>
            <div className="pl-6">
              {institutionData.sportTeams ? (
                institutionData.sportTeams.map((team: any, index: number) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {team.sport} - {team.subCategory || team.category} ({team.students.length} students)
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sports selected</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fee Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingFees ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Calculating fees...</span>
              </div>
            </div>
          ) : feeCalculation ? (
            <div className="space-y-3">
              {/* Sports Fees */}
              {feeCalculation.breakdown?.sports_fees && feeCalculation.breakdown.sports_fees.length > 0 && (
                <div className="space-y-2">
                  {feeCalculation.breakdown.sports_fees.map((sport: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{sport.sport_name} ({sport.type}):</span>
                      <span className="font-medium">₹{(sport.fee || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Parent Fee */}
              {feeCalculation.breakdown?.parent_fee > 0 && (
                <div className="flex justify-between items-center">
                  <span>Parent Pass Fee:</span>
                  <span className="font-medium">₹{(feeCalculation.breakdown.parent_fee || 0).toLocaleString()}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">₹{fees.totalFee.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Sports Registration Fee ({institutionData.sportTeams?.length || 0} × ₹{FEE_PER_SPORT}):</span>
                <span className="font-medium">₹{fees.sportsFee.toLocaleString()}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">₹{fees.totalFee.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={selectedPaymentOption === "payNow" ? "default" : "outline"}
              onClick={() => setSelectedPaymentOption("payNow")}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <DollarSign className="h-6 w-6" />
              <span className="font-semibold">Pay Now</span>
              <span className="text-xs opacity-80">Direct payment gateway</span>
            </Button>

            <Button
              variant={selectedPaymentOption === "sponsor" ? "default" : "outline"}
              onClick={() => setSelectedPaymentOption("sponsor")}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <HandHeart className="h-6 w-6" />
              <span className="font-semibold">Get Sponsor</span>
              <span className="text-xs opacity-80">Request sponsorship</span>
            </Button>

            <Button
              variant={selectedPaymentOption === "payByStudent" ? "default" : "outline"}
              onClick={() => setSelectedPaymentOption("payByStudent")}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <Mail className="h-6 w-6" />
              <span className="font-semibold">Pay by Student</span>
              <span className="text-xs opacity-80">Email students payment links</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conditional Forms */}
      {selectedPaymentOption === "sponsor" && renderSponsorForm()}

      {selectedPaymentOption === "payByStudent" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Payment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="font-medium">Payment emails will be sent to all {institutionData.sportTeams 
                ? institutionData.sportTeams.reduce((total: number, team: any) => total + team.students.length, 0)
                : institutionData.students?.length || 0
              } registered students.</p>
              <p className="text-sm text-muted-foreground">
                Each email will include: Student details, fee breakdown, and secure payment link.
              </p>
            </div>
            <Button onClick={handlePayByStudent} disabled={processing} className="w-full mt-4">
              {processing ? "Sending Emails..." : "Send Payment Instructions"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading || processing}>
          Back
        </Button>
        {selectedPaymentOption === "payNow" && (
          <Button 
            onClick={handlePayNow} 
            disabled={processing}
            className="min-w-[140px]"
          >
            {processing ? "Processing..." : "Proceed to Payment"}
          </Button>
        )}
      </div>
    </div>
  );
};