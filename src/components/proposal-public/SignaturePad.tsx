import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import SignaturePadLib from "signature_pad";
import { PenTool, Trash2, Loader2, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SignaturePadProps {
  onSign: (signatureBase64: string) => void;
  isSubmitting: boolean;
  clientName: string;
}

export function SignaturePad({ onSign, isSubmitting, clientName }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadLib | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const isMobile = useIsMobile();
  
  // Canvas height - larger on mobile for easier signing
  const canvasHeight = isMobile ? 220 : 180;

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const signaturePad = new SignaturePadLib(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(30, 30, 30)",
      minWidth: 1.5,
      maxWidth: 3.5,
    });
    
    signaturePadRef.current = signaturePad;
    
    // Resize canvas
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = container.offsetWidth * ratio;
      canvas.height = canvasHeight * ratio;
      canvas.style.width = `${container.offsetWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.getContext("2d")?.scale(ratio, ratio);
      signaturePad.clear();
      setIsEmpty(true);
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Track if signature is empty
    signaturePad.addEventListener("endStroke", () => {
      setIsEmpty(signaturePad.isEmpty());
    });
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      signaturePad.off();
    };
  }, [canvasHeight]);
  
  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsEmpty(true);
  };
  
  const handleSign = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) return;
    
    const dataUrl = signaturePadRef.current.toDataURL("image/png");
    onSign(dataUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gallery-accent/10 mb-3 sm:mb-4">
          <PenTool className="h-7 w-7 sm:h-8 sm:w-8 text-gallery-accent" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-editorial-display text-gallery-text mb-1 sm:mb-2">
          Assinatura Digital
        </h2>
        <p className="text-sm sm:text-base text-gallery-text-muted">
          Desenhe sua assinatura no campo abaixo
        </p>
      </div>
      
      {/* Signature Canvas */}
      <div className="gallery-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6">
        {/* Landscape hint for mobile */}
        {isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2.5 bg-gallery-accent/10 rounded-lg flex items-center gap-2.5"
          >
            <RotateCcw className="h-4 w-4 text-gallery-accent flex-shrink-0" />
            <p className="text-xs text-gallery-text-muted">
              Gire o celular para uma área de assinatura maior
            </p>
          </motion.div>
        )}
        
        <div className="mb-3 sm:mb-4 text-center">
          <p className="text-xs sm:text-sm text-gallery-text-muted">
            Assinatura de: <span className="font-medium text-gallery-text">{clientName}</span>
          </p>
        </div>
        
        <div 
          ref={containerRef} 
          className="relative bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gallery-border"
        >
          <canvas
            ref={canvasRef}
            className="touch-none cursor-crosshair w-full"
          />
          
          {/* Signature guide line */}
          <div className="absolute bottom-10 sm:bottom-8 left-4 sm:left-6 right-4 sm:right-6 border-b border-dashed border-gray-300" />
          
          {/* X mark for signature start */}
          <div className="absolute bottom-8 sm:bottom-6 left-4 sm:left-6 text-gray-300 text-lg font-light">
            ✕
          </div>
          
          {/* Clear button - floating */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white h-8 px-2.5"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Limpar</span>
          </Button>
        </div>
        
        <p className="text-xs text-center text-gallery-text-muted mt-2.5 sm:mt-3">
          Use o {isMobile ? 'dedo' : 'mouse ou dedo'} para desenhar sua assinatura
        </p>
      </div>
      
      {/* Legal disclaimer */}
      <div className="gallery-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-gallery-text-muted">
        <p>
          ⚖️ Ao assinar, você concorda que esta assinatura digital tem a mesma validade 
          jurídica de uma assinatura manuscrita, conforme a Lei 14.063/2020.
        </p>
      </div>
      
      {/* Submit button */}
      <Button
        onClick={handleSign}
        disabled={isEmpty || isSubmitting}
        className="w-full gallery-btn-primary h-14 text-base sm:text-lg font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Assinando...
          </>
        ) : (
          <>
            <Check className="h-5 w-5 mr-2" />
            Assinar Digitalmente
          </>
        )}
      </Button>
    </motion.div>
  );
}
