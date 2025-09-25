import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileCheck, 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Signature,
  Download
} from "lucide-react";

interface ConsentItem {
  id: string;
  title: string;
  type: 'waiver' | 'privacy' | 'declaration';
  status: 'pending' | 'signed' | 'required';
  description: string;
  content: string;
  lastUpdated?: string;
  signedDate?: string;
}

const ConsentPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [selectedConsent, setSelectedConsent] = useState<ConsentItem | null>(null);
  
  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      id: 'waiver-liability',
      title: 'Waiver & Liability Release',
      type: 'waiver',
      status: 'required',
      description: 'Acknowledgment of risks and release of liability for sports participation',
      content: `WAIVER AND RELEASE OF LIABILITY

I, the undersigned participant (or parent/guardian if participant is under 18), acknowledge and agree to the following:

ASSUMPTION OF RISK:
I understand that participation in sports activities involves inherent risks including but not limited to:
- Physical injury, disability, or death
- Property damage or loss
- Accidents during transportation to and from events
- Injuries from other participants, equipment, or facilities

RELEASE OF LIABILITY:
I hereby release, waive, discharge, and covenant not to sue the Sports Event Management Organization, its officers, employees, volunteers, sponsors, and affiliated organizations from any and all liability, claims, demands, actions, and causes of action whatsoever arising out of or related to any loss, damage, or injury that may be sustained while participating in sports activities.

MEDICAL TREATMENT:
I consent to emergency medical treatment if needed and understand that I am responsible for all medical expenses incurred.

PHOTOGRAPHIC RELEASE:
I consent to the use of photographs, videos, or other recordings of my participation for promotional purposes.

This waiver is binding and effective for all sports events organized by the institution during the current academic year.`
    },
    {
      id: 'privacy-notice',
      title: 'Privacy Notice & Data Processing',
      type: 'privacy',
      status: 'pending',
      description: 'Understanding how your personal information is collected and used',
      content: `PRIVACY NOTICE AND DATA PROCESSING CONSENT

INFORMATION COLLECTION:
We collect and process the following personal information:
- Personal details (name, date of birth, contact information)
- Academic information (student ID, institution details)
- Medical information (for safety and emergency purposes)
- Guardian/parent contact information
- Payment and registration data
- Photographs and videos during events

PURPOSE OF DATA PROCESSING:
Your information is used for:
- Event registration and management
- Emergency contact and medical care
- Communication regarding events and updates
- Payment processing and record keeping
- Compliance with institutional requirements
- Safety and security measures

DATA SHARING:
We may share your information with:
- Medical professionals in case of emergencies
- Educational institutions for verification
- Payment processors for transaction handling
- Event officials and organizers as necessary

DATA RETENTION:
We retain your information for the duration of your participation plus 3 years for record keeping, unless required longer by law.

YOUR RIGHTS:
You have the right to:
- Access your personal data
- Correct inaccurate information
- Request data deletion (subject to legal requirements)
- Withdraw consent (may affect participation)

By signing below, you consent to the collection, processing, and use of your personal information as described in this notice.`
    },
    {
      id: 'participation-declaration',
      title: 'Participation Declaration',
      type: 'declaration',
      status: 'pending',
      description: 'Declaration of fitness, eligibility, and commitment to participate',
      content: `PARTICIPATION DECLARATION AND COMMITMENT

FITNESS AND HEALTH DECLARATION:
I declare that:
- I am physically and mentally fit to participate in the selected sports activities
- I have disclosed all relevant medical conditions and allergies
- I will inform organizers immediately of any changes to my health status
- I understand the importance of proper warm-up and safety procedures

ELIGIBILITY CONFIRMATION:
I confirm that:
- All information provided in my registration is true and accurate
- I am eligible to represent my institution in sports competitions
- I have not been suspended or banned from sports participation
- My academic standing allows for sports participation

CONDUCT AND COMPLIANCE:
I agree to:
- Follow all rules, regulations, and codes of conduct
- Respect fellow participants, officials, and organizers
- Maintain good sportsmanship at all times
- Comply with anti-doping policies and procedures
- Accept decisions of officials and dispute resolution processes

COMMITMENT:
I understand and commit to:
- Attend all required training sessions and meetings
- Participate in all scheduled matches/events unless medically excused
- Represent my institution with dignity and integrity
- Follow team guidelines and coaching instructions

CONSEQUENCES:
I understand that violation of these commitments may result in:
- Suspension from current or future events
- Disciplinary action by my institution
- Forfeiture of registration fees
- Removal from team or individual competitions

This declaration remains valid for the current sports season and all related activities.`
    }
  ]);

  const [agreements, setAgreements] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = (consentId: string, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [consentId]: checked }));
  };

  const handleSignConsent = async (consentId: string) => {
    if (!agreements[consentId]) {
      toast({
        title: "Agreement Required",
        description: "Please read and agree to the terms before signing.",
        variant: "destructive",
      });
      return;
    }

    if (!digitalSignature.trim()) {
      toast({
        title: "Signature Required",
        description: "Please enter your full name as digital signature.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentDate = new Date().toLocaleDateString();
      
      setConsents(prev => prev.map(consent => 
        consent.id === consentId 
          ? { ...consent, status: 'signed', signedDate: currentDate }
          : consent
      ));

      toast({
        title: "Document Signed Successfully",
        description: "Your consent has been recorded and saved.",
      });

      setDigitalSignature("");
      setSelectedConsent(null);
    } catch (error) {
      toast({
        title: "Signing Failed",
        description: "Failed to sign document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignAll = async () => {
    const pendingConsents = consents.filter(c => c.status !== 'signed');
    
    // Check if all consents are agreed to
    const allAgreed = pendingConsents.every(consent => agreements[consent.id]);
    
    if (!allAgreed) {
      toast({
        title: "All Agreements Required",
        description: "Please read and agree to all consent forms.",
        variant: "destructive",
      });
      return;
    }

    if (!digitalSignature.trim()) {
      toast({
        title: "Signature Required", 
        description: "Please enter your full name as digital signature.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      const currentDate = new Date().toLocaleDateString();
      
      setConsents(prev => prev.map(consent => ({
        ...consent,
        status: 'signed',
        signedDate: currentDate
      })));

      toast({
        title: "All Documents Signed",
        description: "All consent forms have been successfully signed and recorded.",
      });

      setDigitalSignature("");
      setAgreements({});
    } catch (error) {
      toast({
        title: "Signing Failed",
        description: "Failed to sign documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'required':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-accent text-accent-foreground">Signed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case 'required':
        return <Badge variant="destructive">Required</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const allSigned = consents.every(consent => consent.status === 'signed');
  const pendingCount = consents.filter(consent => consent.status !== 'signed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consent & Declarations</h1>
        <p className="text-muted-foreground">
          Review and sign required consent forms and declarations
        </p>
      </div>

      {/* Status Overview */}
      <Card className={`shadow-medium ${allSigned ? 'border-accent' : 'border-warning'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {allSigned ? (
                <CheckCircle className="h-6 w-6 text-accent" />
              ) : (
                <Clock className="h-6 w-6 text-warning" />
              )}
              <div>
                <CardTitle>
                  {allSigned ? 'All Consents Completed' : `${pendingCount} Consents Pending`}
                </CardTitle>
                <CardDescription>
                  {allSigned 
                    ? 'You have signed all required documents'
                    : 'Please complete the pending consent forms to participate'
                  }
                </CardDescription>
              </div>
            </div>
            {!allSigned && (
              <Badge variant="outline" className="text-warning border-warning">
                Action Required
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Consent Documents List */}
      <div className="space-y-4">
        {consents.map((consent) => (
          <Card key={consent.id} className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(consent.status)}
                  <div>
                    <CardTitle className="text-lg">{consent.title}</CardTitle>
                    <CardDescription>{consent.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(consent.status)}
                  {consent.signedDate && (
                    <span className="text-xs text-muted-foreground">
                      Signed: {consent.signedDate}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {selectedConsent?.id === consent.id && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="max-h-64 overflow-y-auto p-4 bg-background border rounded text-sm whitespace-pre-wrap">
                    {consent.content}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedConsent(
                      selectedConsent?.id === consent.id ? null : consent
                    )}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {selectedConsent?.id === consent.id ? 'Hide' : 'Read'} Document
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                {consent.status !== 'signed' && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`agree-${consent.id}`}
                        checked={agreements[consent.id] || false}
                        onCheckedChange={(checked) => handleCheckboxChange(consent.id, !!checked)}
                      />
                      <Label htmlFor={`agree-${consent.id}`} className="text-sm cursor-pointer">
                        I have read and agree
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {consent.status !== 'signed' && selectedConsent?.id === consent.id && agreements[consent.id] && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/5">
                  <div className="space-y-2">
                    <Label htmlFor="signature" className="font-medium">
                      Digital Signature (Enter your full name)
                    </Label>
                    <div className="relative">
                      <Signature className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signature"
                        placeholder="Type your full name as signature"
                        value={digitalSignature}
                        onChange={(e) => setDigitalSignature(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleSignConsent(consent.id)}
                    disabled={loading || !digitalSignature.trim()}
                    className="w-full bg-gradient-primary"
                  >
                    {loading ? "Signing..." : "Sign Document"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sign All Section */}
      {!allSigned && (
        <Card className="shadow-medium border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <span>Sign All Documents</span>
            </CardTitle>
            <CardDescription>
              Sign all consent forms at once after reviewing each document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-medium mb-2">Before signing all documents:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Please read each document carefully by clicking "Read Document"</li>
                <li>• Check the agreement box for each document</li>
                <li>• Enter your full name as digital signature</li>
                <li>• All documents will be signed simultaneously</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signatureAll" className="font-medium">
                  Digital Signature for All Documents
                </Label>
                <div className="relative">
                  <Signature className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="signatureAll"
                    placeholder="Type your full name as signature for all documents"
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleSignAll}
                disabled={loading || !digitalSignature.trim() || pendingCount === 0}
                className="w-full bg-gradient-primary hover:shadow-glow"
                size="lg"
              >
                {loading ? "Signing All Documents..." : `Sign All ${pendingCount} Documents`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsentPage;