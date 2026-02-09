import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Lock, Eye, Sparkles } from "lucide-react";

interface GalleryEmptyStateProps {
  onCreateClick: () => void;
  hasAccess: boolean;
}

export function GalleryEmptyState({ onCreateClick, hasAccess }: GalleryEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
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
            delay: 0.4
          }}
          className="relative mx-auto w-24 h-24 mb-6"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-primary/10 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-primary" />
          </div>

          {/* Floating particles */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-5 w-5 text-amber-400" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
          Nenhuma vitrine ainda
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Apresente seus imóveis com uma experiência premium.
          <br className="hidden sm:block" />
          Seus clientes vão adorar!
        </p>

        {/* CTA Button */}
        {hasAccess && (
          <Button
            variant="gradient"
            size="lg"
            className="gap-2 mb-8"
            onClick={onCreateClick}
          >
            <Plus className="h-5 w-5" />
            Criar Primeira Vitrine
          </Button>
        )}

        {/* Tips */}
        <div className="grid gap-3 sm:grid-cols-2 text-left">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-card/30 border border-white/5"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <Lock className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Senha de Acesso</p>
              <p className="text-xs text-muted-foreground">
                Vitrines com senha têm mais segurança
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-card/30 border border-white/5"
          >
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Eye className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Link Exclusivo</p>
              <p className="text-xs text-muted-foreground">
                Cada vitrine tem seu link único para compartilhar
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
