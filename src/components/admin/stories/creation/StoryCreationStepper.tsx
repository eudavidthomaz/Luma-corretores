import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  shortLabel?: string;
}

interface StoryCreationStepperProps {
  currentStep: number;
  canProceedToStep2: boolean;
  canProceedToStep3: boolean;
  canProceedToStep4: boolean;
  onStepClick: (step: number) => void;
}

const steps: Step[] = [
  { number: 1, label: "Detalhes", shortLabel: "Detalhes" },
  { number: 2, label: "Capa", shortLabel: "Capa" },
  { number: 3, label: "Capítulos", shortLabel: "Caps" },
  { number: 4, label: "Revisar", shortLabel: "Revisar" },
];

export function StoryCreationStepper({
  currentStep,
  canProceedToStep2,
  canProceedToStep3,
  canProceedToStep4,
  onStepClick,
}: StoryCreationStepperProps) {
  const canAccessStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return true;
      case 2:
        return canProceedToStep2;
      case 3:
        return canProceedToStep3;
      case 4:
        return canProceedToStep4;
      default:
        return false;
    }
  };

  const isStepComplete = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return canProceedToStep2;
      case 2:
        return canProceedToStep3;
      case 3:
        return canProceedToStep4;
      case 4:
        return false;
      default:
        return false;
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isComplete = isStepComplete(step.number);
        const canAccess = canAccessStep(step.number);

        return (
          <div key={step.number} className="flex items-center">
            {/* Step Node */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => canAccess && onStepClick(step.number)}
              disabled={!canAccess}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl transition-all",
                isActive && "bg-primary/20 border border-primary/40",
                !isActive && canAccess && "hover:bg-muted/50 cursor-pointer",
                !isActive && !canAccess && "opacity-40 cursor-not-allowed"
              )}
            >
              {/* Step Number/Check */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  !isActive && isComplete && "bg-emerald-500 text-white",
                  !isActive && !isComplete && "bg-muted text-muted-foreground"
                )}
              >
                {isComplete && !isActive ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.number
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium",
                  isActive && "text-foreground",
                  !isActive && "text-muted-foreground"
                )}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel || step.label}</span>
              </span>
            </motion.button>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-1 transition-colors",
                  isComplete ? "bg-emerald-500/50" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
