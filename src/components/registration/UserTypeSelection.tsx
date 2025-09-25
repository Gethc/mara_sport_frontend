import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GraduationCap, Building2 } from "lucide-react";
import sportsHero from "@/assets/sports-hero.jpg";

interface UserTypeSelectionProps {
  onTypeSelect: (type: "student" | "institution") => void;
}

export const UserTypeSelection = ({ onTypeSelect }: UserTypeSelectionProps) => {
  const [selectedType, setSelectedType] = useState<"student" | "institution" | "">("");

  const handleContinue = () => {
    if (selectedType) {
      onTypeSelect(selectedType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Hero Section */}
          <div className="text-center md:text-left space-y-6">
            <div className="relative">
              <img 
                src={sportsHero} 
                alt="Registration Portal" 
                className="rounded-2xl shadow-large w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                <div className="text-white text-center">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Join Our Platform</h1>
                  <p className="text-xl opacity-90">Choose your registration type to get started</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selection Form */}
          <Card className="shadow-large border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Select Registration Type
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose how you want to register
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as "student" | "institution")}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Student Registration</div>
                          <div className="text-sm text-muted-foreground">
                            Register as a student to participate in sports events
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="institution" id="institution" />
                    <Label htmlFor="institution" className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Institution Registration</div>
                          <div className="text-sm text-muted-foreground">
                            Register your institution to manage students and events
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                disabled={!selectedType}
              >
                Continue Registration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};