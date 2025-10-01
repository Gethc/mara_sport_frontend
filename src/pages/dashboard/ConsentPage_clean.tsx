import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [selectedConsent, setSelectedConsent] = useState<ConsentItem | null>(null);
  
  const [consents, setConsents] = useState<ConsentItem[]>([]);

  // Fetch consents from API (placeholder - no API endpoint yet)
  const fetchConsents = async () => {
    try {
      setLoading(true);
      // TODO: Implement consent API endpoint
      // const response = await apiService.getConsents();
      // setConsents(response.data);
      setConsents([]); // Empty for now
    } catch (error) {
      console.error('Error fetching consents:', error);
      setConsents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const [agreements, setAgreements] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = (consentId: string, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [consentId]: checked }));
  };

  const handleSignConsent = async (consentId: string) => {
    if (!agreements[consentId]) {
      toast({
        title: "Agreement Required",
        description: "Please check the agreement box before signing.",
        variant: "destructive",
      });
      return;
    }

    if (!digitalSignature.trim()) {
      toast({
        title: "Signature Required",
        description: "Please provide your digital signature.",
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
          ? { ...consent, status: 'signed' as const, signedDate: currentDate }
          : consent
      ));

      toast({
        title: "Success!",
        description: "Consent form signed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign consent form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignAll = async () => {
    const pendingConsents = consents.filter(consent => consent.status === 'required');
    
    if (pendingConsents.length === 0) {
      toast({
        title: "No Pending Consents",
        description: "All consent forms are already signed.",
      });
      return;
    }

    if (!digitalSignature.trim()) {
      toast({
        title: "Signature Required", 
        description: "Please provide your digital signature.",
        variant: "destructive",
      });
      return;
    }

    const allAgreed = pendingConsents.every(consent => agreements[consent.id]);
    
    if (!allAgreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to all consent forms before signing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      const currentDate = new Date().toLocaleDateString();
      setConsents(prev => prev.map(consent => 
        consent.status === 'required' 
          ? { ...consent, status: 'signed' as const, signedDate: currentDate }
          : consent
      ));

      toast({
        title: "Success!",
        description: "All consent forms signed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign consent forms. Please try again.",
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
  const pendingConsents = consents.filter(consent => consent.status === 'required');

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
              <CardTitle>
                {allSigned ? "All Consents Signed" : "Pending Consents"}
              </CardTitle>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {consents.filter(c => c.status === 'signed').length} / {consents.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Consent Documents List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="font-semibold text-lg mb-2">Loading consent forms...</h3>
              <p className="text-muted-foreground">
                Please wait while we fetch your consent documents
              </p>
            </CardContent>
          </Card>
        ) : consents.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No consent forms found</h3>
              <p className="text-muted-foreground">
                You have no consent forms to review at this time
              </p>
            </CardContent>
          </Card>
        ) : (
          consents.map((consent) => (
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
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {consent.status !== 'signed' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="max-h-64 overflow-y-auto p-4 bg-background border rounded text-sm whitespace-pre-wrap">
                    {consent.content}
                  </div>
                </div>
              )}

              {consent.status === 'signed' && consent.signedDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-accent">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Signed on {consent.signedDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {consent.status !== 'signed' && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Digital Signature</Label>
                    <div className="relative">
                      <Input
                        placeholder="Type your full name to sign"
                        value={digitalSignature}
                        onChange={(e) => setDigitalSignature(e.target.value)}
                        className="pr-10"
                      />
                      <Signature className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`agree-${consent.id}`}
                        checked={agreements[consent.id] || false}
                        onCheckedChange={(checked) => handleCheckboxChange(consent.id, checked as boolean)}
                      />
                      <Label htmlFor={`agree-${consent.id}`} className="text-sm">
                        I agree to the terms and conditions
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSignConsent(consent.id)}
                    disabled={!agreements[consent.id] || !digitalSignature.trim() || loading}
                    className="w-full bg-gradient-primary hover:shadow-glow"
                    size="lg"
                  >
                    {loading ? "Signing..." : "Sign Document"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Sign All Section */}
      {!allSigned && (
        <Card className="shadow-medium border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              Sign All Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                You can sign all pending consent forms at once. Make sure you have read and agreed to all terms.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Digital Signature</Label>
                <div className="relative">
                  <Input
                    placeholder="Type your full name to sign all documents"
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    className="pr-10"
                  />
                  <Signature className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Agree to All</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agree-all"
                    checked={pendingConsents.every(consent => agreements[consent.id])}
                    onCheckedChange={(checked) => {
                      pendingConsents.forEach(consent => {
                        handleCheckboxChange(consent.id, checked as boolean);
                      });
                    }}
                  />
                  <Label htmlFor="agree-all" className="text-sm">
                    I agree to all terms and conditions
                  </Label>
                </div>
              </div>

              <Button
                onClick={handleSignAll}
                disabled={!pendingConsents.every(consent => agreements[consent.id]) || !digitalSignature.trim() || loading}
                className="w-full bg-gradient-primary hover:shadow-glow"
                size="lg"
              >
                {loading ? "Signing All Documents..." : `Sign All ${pendingConsents.length} Documents`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsentPage;
