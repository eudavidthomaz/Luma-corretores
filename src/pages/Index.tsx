import { useRef, useState, useEffect } from "react";
import { useScroll, useTransform } from "framer-motion";
import {
  LandingHero,
  LandingSocialProof,
  LandingProblem,
  LandingSolution,
  LandingArsenal,
  LandingVideo,
  LandingPricing,
  LandingTestimonials,
  LandingGuarantee,
  LandingAuthority,
  LandingFAQ,
  LandingCTA,
  LandingFooter,
  LandingNav,
  LandingBackground
} from "@/components/landing";

const sections = [
  { id: "hero", label: "Início" },
  { id: "problem", label: "O Problema" },
  { id: "solution", label: "A Solução" },
  { id: "arsenal", label: "Arsenal" },
  { id: "video", label: "Vídeo" },
  { id: "pricing", label: "Planos" },
  { id: "testimonials", label: "Resultados" },
  { id: "authority", label: "Manifesto" },
  { id: "cta", label: "Começar" }
];

export default function Index() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Track active section
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const viewportHeight = window.innerHeight;
      const sectionIndex = Math.round(scrollTop / viewportHeight);
      setActiveSection(Math.min(sectionIndex, sections.length - 1));
    };
    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    if (!containerRef.current) return;
    const viewportHeight = window.innerHeight;
    containerRef.current.scrollTo({ top: index * viewportHeight, behavior: "smooth" });
  };

  // Parallax transforms
  const auroraY1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const auroraY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const auroraY3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.8]);
  const iphoneY = useTransform(scrollYProgress, [0.1, 0.4], [50, -30]);
  const manifestoScale = useTransform(scrollYProgress, [0.5, 0.7], [0.95, 1]);

  return (
    <div ref={containerRef} className="snap-container bg-background overflow-x-hidden">
      <LandingBackground auroraY1={auroraY1} auroraY2={auroraY2} auroraY3={auroraY3} />
      <LandingNav sections={sections} activeSection={activeSection} onNavigate={scrollToSection} />
      
      {/* 1. Hero - Paradoxo + Promessa */}
      <LandingHero textY={heroTextY} opacity={heroOpacity} onScrollDown={() => scrollToSection(1)} />
      
      {/* 2. Social Proof Bar */}
      <LandingSocialProof />
      
      {/* 3. Problema - 3 Dores */}
      <LandingProblem />
      
      {/* 4. Solução - Demo Luma */}
      <LandingSolution iphoneY={iphoneY} />
      
      {/* 5. Arsenal - 4 Módulos */}
      <LandingArsenal />
      
      {/* 6. Vídeo Demo */}
      <LandingVideo />
      
      {/* 7. Pricing - Cards + Comparativo + ROI */}
      <LandingPricing />
      
      {/* 8. Testimonials - Social Proof */}
      <LandingTestimonials />
      
      {/* 9. Guarantee - Risco Zero */}
      <LandingGuarantee />
      
      {/* 10. Authority - Manifesto Liga */}
      <LandingAuthority scale={manifestoScale} />
      
      {/* 11. FAQ - Objeções */}
      <LandingFAQ />
      
      {/* 12. CTA Final - Urgência */}
      <LandingCTA />
      
      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
