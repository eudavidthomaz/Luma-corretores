import { ReactNode } from "react";

export type MinisiteTheme = 'dark' | 'editorial';

interface MinisiteThemeProviderProps {
  theme: MinisiteTheme;
  children: ReactNode;
}

export function MinisiteThemeProvider({ theme, children }: MinisiteThemeProviderProps) {
  if (theme === 'editorial') {
    return (
      <div className="minisite-editorial-theme min-h-screen bg-background">
        <div className="gallery-grain relative min-h-screen">
          {children}
        </div>
      </div>
    );
  }
  
  // Dark theme (default) - uses root variables
  return <div className="min-h-screen bg-background">{children}</div>;
}
