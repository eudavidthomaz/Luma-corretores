import { ReactNode } from "react";

interface ProposalThemeProviderProps {
  children: ReactNode;
}

export function ProposalThemeProvider({ children }: ProposalThemeProviderProps) {
  return (
    <div className="gallery-theme min-h-screen bg-gallery-background">
      <div className="gallery-grain relative min-h-screen">
        {children}
      </div>
    </div>
  );
}
