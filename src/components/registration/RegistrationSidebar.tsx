import { cn } from "@/lib/utils";
import { 
  User, 
  Upload, 
  Users, 
  Trophy, 
  CreditCard, 
  CheckCircle 
} from "lucide-react";

interface RegistrationSidebarProps {
  currentStep: number;
  completedSteps: number[];
  showOnMobile?: boolean;
}

const steps = [
  {
    id: 1,
    title: "Personal Details",
    icon: User,
    description: "Basic information"
  },
  {
    id: 2,
    title: "Document Upload",
    icon: Upload,
    description: "Required documents"
  },
  {
    id: 3,
    title: "Parent & Medical Info",
    icon: Users,
    description: "Guardian & health details"
  },
  {
    id: 4,
    title: "Sports Selection",
    icon: Trophy,
    description: "Choose your sports"
  },
  {
    id: 5,
    title: "Review & Payment",
    icon: CreditCard,
    description: "Final review"
  }
];

export const RegistrationSidebar = ({ currentStep, completedSteps, showOnMobile = false }: RegistrationSidebarProps) => {
  return (
    <div className={(showOnMobile ? "block" : "hidden md:block") + " w-64 bg-card border-r border-border p-6 min-h-screen md:sticky md:top-0 md:self-start md:max-h-screen overflow-auto"}>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground">Registration Progress</h2>
        <p className="text-sm text-muted-foreground mt-1">Complete all steps to register</p>
      </div>
      
      <nav className="space-y-2">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isAccessible = step.id <= currentStep || isCompleted;
          
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-smooth",
                isActive && "bg-primary/10 border border-primary/20",
                isCompleted && !isActive && "bg-accent/10",
                !isAccessible && "opacity-50"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-smooth",
                isCompleted ? "bg-accent text-accent-foreground" :
                isActive ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium transition-smooth",
                  isActive ? "text-primary" :
                  isCompleted ? "text-accent" :
                  "text-foreground"
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
              
              {isActive && (
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="mt-8 p-4 bg-gradient-card rounded-lg border">
        <div className="text-sm font-medium text-foreground mb-2">
          Progress: {completedSteps.length} of {steps.length} steps
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-smooth"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};