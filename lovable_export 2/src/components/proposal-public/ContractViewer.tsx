import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Check, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ContractViewerProps {
  content?: string;
  isAccepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  onContinue: () => void;
}

export function ContractViewer({ 
  content,
  isAccepted, 
  onAcceptChange, 
  onContinue 
}: ContractViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowTopFade(scrollTop > 20);
      setShowBottomFade(scrollTop + clientHeight < scrollHeight - 20);
      
      // Check if scrolled near bottom
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setHasScrolledToBottom(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gallery-accent/10 mb-3 sm:mb-4">
          <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-gallery-accent" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-editorial-display text-gallery-text mb-1 sm:mb-2">
          Contrato
        </h2>
        <p className="text-sm sm:text-base text-gallery-text-muted">
          Leia atentamente o contrato abaixo
        </p>
      </div>
      
      {/* Contract Content with scroll indicators */}
      {content ? (
        <div className="relative">
          {/* Top fade indicator */}
          <div className={`absolute top-0 left-0 right-0 h-8 sm:h-10 bg-gradient-to-b from-gallery-surface to-transparent pointer-events-none z-10 rounded-t-2xl transition-opacity duration-200 ${showTopFade ? 'opacity-100' : 'opacity-0'}`} />
          
          <div 
            ref={scrollRef}
            className="gallery-glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-h-[50vh] sm:max-h-[55vh] overflow-y-auto scrollbar-thin"
          >
            <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base text-gallery-text leading-relaxed sm:leading-loose">
              {content}
            </pre>
          </div>
          
          {/* Bottom fade indicator with scroll hint */}
          <div className={`absolute bottom-0 left-0 right-0 h-12 sm:h-14 bg-gradient-to-t from-gallery-surface to-transparent pointer-events-none z-10 rounded-b-2xl flex items-end justify-center pb-2 transition-opacity duration-200 ${showBottomFade ? 'opacity-100' : 'opacity-0'}`}>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1 text-xs text-gallery-text-muted"
            >
              <ChevronDown className="h-4 w-4" />
              <span className="hidden sm:inline">Role para ler mais</span>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="gallery-glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
          <p className="text-gallery-text-muted">
            Nenhum contrato disponível
          </p>
        </div>
      )}
      
      {/* Accept Checkbox - Larger touch target */}
      <div className="gallery-glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <label className="flex items-start gap-3 sm:gap-4 cursor-pointer active:scale-[0.99] transition-transform">
          <Checkbox
            checked={isAccepted}
            onCheckedChange={(checked) => onAcceptChange(checked === true)}
            className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4 border-gallery-accent data-[state=checked]:bg-gallery-accent data-[state=checked]:border-gallery-accent flex-shrink-0"
          />
          <span className="text-sm sm:text-base text-gallery-text leading-relaxed">
            Li e concordo com todos os termos e condições descritos no contrato acima.
            Entendo que este é um documento juridicamente vinculativo.
          </span>
        </label>
      </div>
      
      {/* Continue Button */}
      <Button
        onClick={onContinue}
        disabled={!isAccepted}
        className="w-full gallery-btn-primary h-14 text-base sm:text-lg font-semibold"
      >
        <Check className="h-5 w-5 mr-2" />
        Aceitar e Assinar
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </motion.div>
  );
}
