import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Settings } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface FeeManagementProps {
  onFeeCalculated?: (fee: number) => void;
}

export const FeeManagement = ({ onFeeCalculated }: FeeManagementProps) => {
  const { toast } = useToast();
  const [sports, setSports] = useState<any[]>([]);
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [disciplineCount, setDisciplineCount] = useState<number>(1);
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);
  const [feeRules, setFeeRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sports on component mount
  useEffect(() => {
    loadSports();
  }, []);

  // Load fee rules when sport is selected
  useEffect(() => {
    if (selectedSport) {
      loadFeeRules(selectedSport);
    }
  }, [selectedSport]);

  const loadSports = async () => {
    try {
      const response = await apiService.getSportsPublic();
      const data = response.data as any;
      if (data && data.success) {
        setSports(data.data);
      }
    } catch (error) {
      console.error("Error loading sports:", error);
    }
  };

  const loadFeeRules = async (sportId: number) => {
    try {
      const response = await apiService.getFeeRulesBySport(sportId);
      const data = response.data as any;
      if (data && data.success) {
        setFeeRules(data.data.fee_rules);
      }
    } catch (error) {
      console.error("Error loading fee rules:", error);
    }
  };

  const calculateFee = async () => {
    if (!selectedSport) {
      setError("Please select a sport");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.calculateFee(selectedSport, disciplineCount);
      const data = response.data as any;
      if (data && data.success) {
        const fee = data.data.fee;
        setCalculatedFee(fee);
        onFeeCalculated?.(fee);
        
        toast({
          title: "Fee Calculated! 💰",
          description: `Total fee: ₹${fee}`,
        });
      } else {
        throw new Error(data?.message || "Failed to calculate fee");
      }
    } catch (error) {
      console.error("Error calculating fee:", error);
      setError(error instanceof Error ? error.message : "Failed to calculate fee");
      toast({
        title: "Error Calculating Fee",
        description: error instanceof Error ? error.message : "Failed to calculate fee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSportData = sports.find(sport => sport.id === selectedSport);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fee Calculator
          </CardTitle>
          <CardDescription>
            Calculate registration fees based on sport and discipline count
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Select Sport</Label>
              <Select value={selectedSport?.toString() || ""} onValueChange={(value) => setSelectedSport(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id.toString()}>
                      {sport.name} ({sport.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disciplines">Number of Disciplines</Label>
              <Input
                id="disciplines"
                type="number"
                min="1"
                max="10"
                value={disciplineCount}
                onChange={(e) => setDisciplineCount(parseInt(e.target.value) || 1)}
                placeholder="Enter discipline count"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={calculateFee} 
            disabled={!selectedSport || isLoading}
            className="w-full"
          >
            {isLoading ? "Calculating..." : "Calculate Fee"}
          </Button>

          {calculatedFee !== null && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Total Fee: ₹{calculatedFee}</span>
              </div>
              {selectedSportData && (
                <p className="text-sm text-green-600 mt-1">
                  For {selectedSportData.name} with {disciplineCount} discipline{disciplineCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {feeRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Fee Rules for {selectedSportData?.name}
            </CardTitle>
            <CardDescription>
              Available fee structures for this sport
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {feeRules.map((rule) => (
                <div key={rule.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {rule.discipline_count} Discipline{rule.discipline_count > 1 ? 's' : ''}
                    </span>
                    <Badge variant="secondary">₹{rule.fee}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
