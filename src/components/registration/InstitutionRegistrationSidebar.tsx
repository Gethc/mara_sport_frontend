import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Trophy, Users, CreditCard, CheckCircle } from "lucide-react";

interface InstitutionRegistrationSidebarProps {
  currentStep: number;
  completedSteps: number[];
  showOnMobile?: boolean;
}

const steps = [
  {
    id: 1,
    title: "Institution Details",
    description: "Basic information and contact details",
    icon: Building,
  },
  // Sports step removed per requirements
  {
    id: 3,
    title: "Add Students", 
    description: "Add students and select sports",
    icon: Users,
  },
  {
    id: 4,
    title: "Payment",
    description: "Review and complete payment",
    icon: CreditCard,
  },
];

export const InstitutionRegistrationSidebar = ({ 
  currentStep, 
  completedSteps,
  showOnMobile = false,
}: InstitutionRegistrationSidebarProps) => {
  return (
    <div className={(showOnMobile ? "block" : "hidden md:block") + " w-80 bg-muted/50 border-r p-6 overflow-y-auto md:sticky md:top-0 md:self-start md:max-h-screen"}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Institution Registration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete all steps to register your institution
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = step.id <= currentStep || isCompleted;
            
            return (
              <Card
                key={step.id}
                className={cn(
                  "transition-all duration-200",
                  isCurrent && "ring-2 ring-primary border-primary",
                  isCompleted && "bg-primary/5 border-primary/20",
                  !isAccessible && "opacity-50"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                        isCurrent && "bg-primary text-primary-foreground border-primary",
                        isCompleted && "bg-primary text-primary-foreground border-primary",
                        !isCurrent && !isCompleted && "border-muted-foreground/30"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{step.title}</h3>
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            Complete
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Progress:</span>
              <span>{completedSteps.length}/{steps.length} steps</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};