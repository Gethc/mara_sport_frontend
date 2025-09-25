import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  School, 
  FileText, 
  Trophy, 
  CreditCard,
  CheckCircle,
  Users,
  Heart,
  AlertTriangle
} from "lucide-react";

interface ReviewPaymentStepProps {
  registrationData: {
    personalDetails: any;
    documents: any;
    parentMedical: any;
    sports: any;
  };
  onComplete: () => void;
  onBack: () => void;
}

export const ReviewPaymentStep = ({ registrationData, onComplete, onBack }: ReviewPaymentStepProps) => {
  const [confirmDetails, setConfirmDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const calculateTotal = () => {
    const baseFee = 50;
    const sportsFee = registrationData.sports?.selectedSports?.length * 25 || 0;
    return baseFee + sportsFee;
  };

  const handlePayment = async () => {
    if (!confirmDetails) {
      setErrors(["Please confirm that all details are correct"]);
      return;
    }

    setProcessing(true);
    setErrors([]);

    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Payment Successful! 🎉",
        description: "Your registration has been completed successfully.",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const { personalDetails, documents, parentMedical, sports } = registrationData;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Review & Payment</CardTitle>
          <CardDescription>
            Please review all your information before proceeding to payment
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Details Summary */}
            <Card className="border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Personal Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">
                    {personalDetails?.firstName} {personalDetails?.middleName} {personalDetails?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{personalDetails?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-medium">{personalDetails?.dateOfBirth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium">{personalDetails?.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Institution:</span>
                  <span className="font-medium">
                    {personalDetails?.instituteName === "Other" ? personalDetails?.otherInstitute : personalDetails?.instituteName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{personalDetails?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{personalDetails?.phoneNumber}</span>
                </div>
              </CardContent>
            </Card>

            {/* Documents Summary */}
            <Card className="border border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <span>Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Student ID Image:</span>
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Age Proof Document:</span>
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                </div>
                {documents?.studentIdImage && (
                  <div className="text-xs text-muted-foreground">
                    Student ID: {documents.studentIdImage.name}
                  </div>
                )}
                {documents?.ageProofDocument && (
                  <div className="text-xs text-muted-foreground">
                    Age Proof: {documents.ageProofDocument.name}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parent & Medical Summary */}
            <Card className="border border-warning/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="h-5 w-5 text-warning" />
                  <span>Parent & Medical Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parents Attending:</span>
                  <span className="font-medium capitalize">{parentMedical?.parentsAttending}</span>
                </div>
                {parentMedical?.parentsAttending === "yes" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parent Name:</span>
                      <span className="font-medium">{parentMedical?.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Relation:</span>
                      <span className="font-medium">{parentMedical?.parentRelation}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medical Facilities:</span>
                  <span className="font-medium capitalize">{parentMedical?.medicalFacilities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allergies/Conditions:</span>
                  <span className="font-medium capitalize">{parentMedical?.allergiesConditions}</span>
                </div>
              </CardContent>
            </Card>

            {/* Sports Summary */}
            <Card className="border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>Sports Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{sports?.participationType} Sports</span>
                </div>
                <div className="space-y-2">
                  <span className="text-muted-foreground">Selected Sports:</span>
                  {sports?.selectedSports?.map((sport: any, index: number) => (
                    <div key={index} className="flex justify-between pl-4">
                      <span>{sport.sport}</span>
                      <span className="text-muted-foreground">{sport.category}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                <div className="flex justify-between">
                  <span>Base Registration Fee</span>
                  <span>$50.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sports Fee ({sports?.selectedSports?.length || 0} sports)</span>
                  <span>${(sports?.selectedSports?.length || 0) * 25}.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary">${calculateTotal()}.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="confirm"
                checked={confirmDetails}
                onCheckedChange={(checked) => setConfirmDetails(!!checked)}
              />
              <div className="space-y-1">
                <label htmlFor="confirm" className="text-sm font-medium cursor-pointer">
                  I confirm all the above details are correct
                </label>
                <p className="text-xs text-muted-foreground">
                  Please review all information carefully. Changes after payment may require additional processing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} disabled={processing}>
              Back
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={!confirmDetails || processing}
              className="bg-gradient-primary min-w-[200px]"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};