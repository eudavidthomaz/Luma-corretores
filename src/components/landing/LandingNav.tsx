import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ligaLogoWhite from "@/assets/liga-logo-white.png";
import lumaLogoWhite from "@/assets/luma-logo-white.png";

interface Section {
  id: string;
  label: string;
}

interface LandingNavProps {
  sections: Section[];
  activeSection: number;
  onNavigate: (index: number) => void;
}

export function LandingNav({ sections, activeSection, onNavigate }: LandingNavProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Fixed Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-5 backdrop-blur-md bg-background/50 safe-area-inset">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <img src={lumaLogoWhite} alt="Luma" className="h-10 md:h-14 w-auto" />
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href="/privacy"
              className="hidden sm:block text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </a>
            <Button
              variant="glass"
              size="sm"
              onClick={() => navigate("/auth")}
              className="gap-1.5 text-sm md:text-base md:gap-2 hover:scale-[1.02] transition-all duration-300 touch-target"
            >
              <span className="hidden sm:inline">Login</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Dot Navigation - Desktop only */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onNavigate(index)}
            className="group relative flex items-center justify-end"
            aria-label={`Ir para ${section.label}`}
          >
            {/* Tooltip */}
            <span className="absolute right-6 px-2 py-1 text-xs text-foreground bg-card/90 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {section.label}
            </span>
            {/* Dot */}
            <motion.div
              className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${activeSection === index
                  ? "bg-primary border-primary scale-125"
                  : "bg-transparent border-muted-foreground/50 hover:border-primary/70"
                }`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            />
          </button>
        ))}
      </div>
    </>
  );
}
