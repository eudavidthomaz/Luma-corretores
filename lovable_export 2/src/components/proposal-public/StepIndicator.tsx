import React from "react";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`
              h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all duration-300
              ${i < currentStep 
                ? 'bg-gallery-accent' 
                : i === currentStep 
                  ? 'bg-gallery-accent/60 ring-4 ring-gallery-accent/20' 
                  : 'bg-gallery-border'
              }
            `}
          />
          {i < totalSteps - 1 && (
            <div
              className={`
                h-0.5 w-4 sm:w-6 rounded-full transition-colors duration-300
                ${i < currentStep ? 'bg-gallery-accent' : 'bg-gallery-border'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
