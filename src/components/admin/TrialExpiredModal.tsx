import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Crown, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysRemaining?: number | null;
}

export function TrialExpiredModal({ isOpen, onClose, daysRemaining }: TrialExpiredModalProps) {
  const navigate = useNavigate();
  const isExpired = daysRemaining === null || daysRemaining <= 0;

  const handleUpgrade = () => {
    onClose();
    navigate("/admin/subscription");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md glass border border-border/50 rounded-2xl p-6 shadow-2xl"
        >
          {/* Close button - only show if not expired */}
          {!isExpired && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${isExpired ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
              <AlertTriangle className={`h-10 w-10 ${isExpired ? 'text-destructive' : 'text-amber-500'}`} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-foreground mb-2">
            {isExpired 
              ? "Seu período de avaliação expirou" 
              : `Seu período de avaliação expira em ${daysRemaining} dia${daysRemaining === 1 ? '' : 's'}`}
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isExpired 
              ? "Escolha um plano para continuar usando a Luma e acessar todos os recursos."
              : "Após o período de avaliação, você precisará escolher um plano para continuar usando a Luma."}
          </p>

          {/* What happens section */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-foreground">
              {isExpired ? "Para continuar:" : "O que acontecerá:"}
            </h3>
            
            <div className="space-y-2">
              {/* Access blocked */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <Lock className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    {isExpired ? "Acesso bloqueado" : "Acesso será bloqueado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Histórias, Galerias, Chat Luma, CRM e Propostas ficam inacessíveis sem um plano ativo
                  </p>
                </div>
              </div>

              {/* Solution */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Crown className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">Escolha seu plano</p>
                  <p className="text-xs text-muted-foreground">
                    A partir de R$47/mês você desbloqueia todos os recursos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              variant="gradient" 
              className="w-full gap-2" 
              onClick={handleUpgrade}
            >
              <Crown className="h-4 w-4" />
              Escolher Plano
            </Button>
            
            {!isExpired && (
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground" 
                onClick={onClose}
              >
                Continuar no trial
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}