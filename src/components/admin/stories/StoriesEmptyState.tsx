import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Lightbulb } from "lucide-react";

interface StoriesEmptyStateProps {
  onCreateClick: () => void;
  canCreate: boolean;
}

export function StoriesEmptyState({ onCreateClick, canCreate }: StoriesEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 sm:p-12 border border-luma-glass-border text-center"
    >
      <div className="max-w-md mx-auto">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="h-10 w-10 text-primary" />
        </motion.div>

        <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
          Nenhum imóvel cadastrado
        </h3>
        <p className="text-muted-foreground mb-6">
          Cadastre seus imóveis para venda ou locação e
          mostre seu portfólio de forma única
        </p>

        <Button
          variant="gradient"
          size="lg"
          className="gap-2 mb-6"
          onClick={onCreateClick}
          disabled={!canCreate}
        >
          <Plus className="h-4 w-4" />
          Cadastrar primeiro imóvel
        </Button>

        {/* Tip */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 text-left">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Dica</p>
            <p className="text-xs text-muted-foreground">
              Imóveis que aparecem no chat da Luma têm 3x mais engajamento.
              Ative "Mostrar no Chat" ao criar!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
