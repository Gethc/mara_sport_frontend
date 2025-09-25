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

interface InstitutionPaymentStepProps {
  institutionData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  loading: boolean;
}

const FEE_PER_STUDENT = 500;
const FEE_PER_SPORT = 1000;

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
    studentsFee: 0,
    sportsFee: 0,
    totalFee: 0,
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Handle new data structure with sportTeams
    let studentCount = 0;
    let sportsCount = 0;
    
    if (institutionData.sportTeams) {
      // New structure: sportTeams array
      studentCount = institutionData.sportTeams.reduce((total: number, team: any) => total + team.students.length, 0);
      sportsCount = institutionData.sportTeams.length;
    } else {
      // Fallback to old structure
      studentCount = institutionData.students?.length || 0;
      sportsCount = institutionData.selectedSports?.length || 0;
    }
    
    const studentsFee = studentCount * FEE_PER_STUDENT;
    const sportsFee = sportsCount * FEE_PER_SPORT;
    const totalFee = studentsFee + sportsFee;

    setFees({
      studentsFee,
      sportsFee,
      totalFee,
    });
  }, [institutionData]);

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
                institutionData.selectedSports?.map((sport: any, index: number) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {sport.sport} - {sport.subCategory}
                  </p>
                )) || <p className="text-sm text-muted-foreground">No sports selected</p>
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
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Students Registration Fee ({institutionData.sportTeams 
                ? institutionData.sportTeams.reduce((total: number, team: any) => total + team.students.length, 0)
                : institutionData.students?.length || 0
              } × ₹{FEE_PER_STUDENT}):</span>
              <span className="font-medium">₹{fees.studentsFee.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Sports Registration Fee ({institutionData.sportTeams?.length || institutionData.selectedSports?.length || 0} × ₹{FEE_PER_SPORT}):</span>
              <span className="font-medium">₹{fees.sportsFee.toLocaleString()}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-primary">₹{fees.totalFee.toLocaleString()}</span>
            </div>
          </div>
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