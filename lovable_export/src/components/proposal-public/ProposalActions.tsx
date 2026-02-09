import { useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProposalActionsProps {
  totalAmount: number;
  onApprove: () => void;
  onRequestChanges: (notes: string) => void;
  isApproving: boolean;
}

export function ProposalActions({ 
  totalAmount, 
  onApprove, 
  onRequestChanges,
  isApproving 
}: ProposalActionsProps) {
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [isSubmittingChanges, setIsSubmittingChanges] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubmitChanges = async () => {
    if (!changeNotes.trim()) return;
    
    setIsSubmittingChanges(true);
    await onRequestChanges(changeNotes);
    setIsSubmittingChanges(false);
    setShowChangesDialog(false);
    setChangeNotes("");
  };

  return (
    <>
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      >
        <div className="gallery-glass border-t border-gallery-border backdrop-blur-xl">
          <div className="container max-w-4xl mx-auto px-4 py-3 sm:py-4">
            {/* Mobile: Vertical layout with prominent CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              
              {/* Primary CTA - Full width on mobile with integrated price */}
              <Button
                onClick={onApprove}
                disabled={isApproving}
                className="w-full sm:w-auto gallery-btn-primary h-12 sm:h-11 text-base sm:text-sm order-1 sm:order-2 font-semibold"
              >
                {isApproving ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Check className="h-5 w-5 mr-2" />
                )}
                <span className="sm:hidden">Aprovar • {formatCurrency(totalAmount)}</span>
                <span className="hidden sm:inline">Aprovar Proposta</span>
              </Button>
              
              {/* Desktop: Show total separately */}
              <div className="hidden sm:block text-center sm:text-left order-1 flex-1">
                <p className="text-xs text-gallery-text-muted">Valor Total</p>
                <p className="text-xl font-bold text-gallery-accent">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              
              {/* Secondary action as text link on mobile */}
              <button
                onClick={() => setShowChangesDialog(true)}
                className="text-sm text-gallery-text-muted hover:text-gallery-accent transition-colors text-center py-2 sm:py-0 order-2 sm:order-3 active:scale-95 sm:active:scale-100"
              >
                <span className="sm:hidden">Preciso de alterações</span>
                <span className="hidden sm:flex sm:items-center sm:gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Solicitar Alteração
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Changes Request Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent className="gallery-glass-card border-gallery-border bg-gallery-surface mx-4 sm:mx-auto max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gallery-text text-lg sm:text-xl">Solicitar Alteração</DialogTitle>
            <DialogDescription className="text-gallery-text-muted text-sm">
              Descreva as alterações que você gostaria de solicitar. O fotógrafo será notificado.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={changeNotes}
            onChange={(e) => setChangeNotes(e.target.value)}
            placeholder="Ex: Gostaria de incluir mais horas de cobertura..."
            className="min-h-[120px] sm:min-h-[150px] gallery-textarea text-base"
          />
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowChangesDialog(false)}
              className="gallery-btn-secondary w-full sm:w-auto h-11"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitChanges}
              disabled={!changeNotes.trim() || isSubmittingChanges}
              className="gallery-btn-primary w-full sm:w-auto h-11"
            >
              {isSubmittingChanges ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
