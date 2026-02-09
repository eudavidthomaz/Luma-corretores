import { ReactNode } from "react";

interface GalleryThemeProviderProps {
  children: ReactNode;
}

export function GalleryThemeProvider({ children }: GalleryThemeProviderProps) {
  return (
    <div className="gallery-theme min-h-screen bg-gallery-background">
      <div className="gallery-grain relative min-h-screen">
        {children}
      </div>
    </div>
  );
}
