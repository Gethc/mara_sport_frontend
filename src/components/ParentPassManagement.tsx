import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ticket, Users } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface ParentPassManagementProps {
  onPassSelected?: (pass: any) => void;
}

export const ParentPassManagement = ({ onPassSelected }: ParentPassManagementProps) => {
  const { toast } = useToast();
  const [parentPasses, setParentPasses] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPricing, setCurrentPricing] = useState<any>(null);
  const [pricingSummary, setPricingSummary] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load parent passes on component mount
  useEffect(() => {
    loadParentPasses();
    loadPricingSummary();
  }, []);

  // Load current pricing when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadCurrentPricing(selectedCategory);
    }
  }, [selectedCategory]);

  const loadParentPasses = async () => {
    try {
      const response = await apiService.getParentPasses();
      const data = response.data as any;
      if (data && data.success) {
        setParentPasses(data.data);
      }
    } catch (error) {
      console.error("Error loading parent passes:", error);
    }
  };

  const loadCurrentPricing = async (category: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getCurrentPricing(category);
      const data = response.data as any;
      if (data && data.success) {
        setCurrentPricing(data.data);
      } else {
        throw new Error(data?.message || "Failed to load current pricing");
      }
    } catch (error) {
      console.error("Error loading current pricing:", error);
      setError(error instanceof Error ? error.message : "Failed to load current pricing");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPricingSummary = async () => {
    try {
      const response = await apiService.getPricingSummary();
      const data = response.data as any;
      if (data && data.success) {
        setPricingSummary(data.data);
      }
    } catch (error) {
      console.error("Error loading pricing summary:", error);
    }
  };

  const handlePassSelect = (pass: any) => {
    onPassSelected?.(pass);
    toast({
      title: "Parent Pass Selected! 🎫",
      description: `${pass.pass_type} pass for category ${pass.category} - ₹${pass.amount}`,
    });
  };

  const getPassTypeColor = (passType: string) => {
    switch (passType?.toLowerCase()) {
      case 'early bird':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'late':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const categories = [...new Set(parentPasses.map(pass => pass.category))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Parent Pass Management
          </CardTitle>
          <CardDescription>
            View and select parent passes for different categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Select Category</Label>
            <Select value={selectedCategory?.toString() || ""} onValueChange={(value) => setSelectedCategory(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toString()}>
                    Category {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentPricing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Current Pricing: ₹{currentPricing.current_amount}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                {currentPricing.pass_type} pass for category {currentPricing.category}
                {currentPricing.is_future_pass ? " (Future pricing)" : " (Current pricing)"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Passes for Category {selectedCategory}
            </CardTitle>
            <CardDescription>
              All available passes for this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parentPasses
                .filter(pass => pass.category === selectedCategory)
                .map((pass) => (
                  <div key={pass.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getPassTypeColor(pass.pass_type)}>
                        {pass.pass_type}
                      </Badge>
                      <span className="font-bold text-lg">₹{pass.amount}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Valid until: {new Date(pass.pass_date).toLocaleDateString()}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handlePassSelect(pass)}
                    >
                      Select Pass
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(pricingSummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Summary</CardTitle>
            <CardDescription>
              Overview of all pricing tiers by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(pricingSummary).map(([category, passes]: [string, any]) => (
                <div key={category} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Category {category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {passes.map((pass: any) => (
                      <div key={pass.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{pass.pass_type}</span>
                        <span className="font-medium">₹{pass.amount}</span>
                      </div>
                    ))}
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
