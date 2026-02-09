import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Zap, Bell, Wifi, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PwaInstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isIOSSafari: boolean;
  onInstall: () => Promise<boolean>;
}

export function PwaInstallModal({ 
  open, 
  onOpenChange, 
  isIOSSafari, 
  onInstall 
}: PwaInstallModalProps) {
  
  const handleInstall = async () => {
    const success = await onInstall();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-luma-glass-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Smartphone className="h-5 w-5 text-primary" />
            Instale a Luma
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isIOSSafari ? (
            // iOS Safari Instructions
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adicione a Luma à sua tela inicial para acesso rápido:
              </p>

              <div className="space-y-3">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Toque em Compartilhar</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      O ícone <Share className="h-3.5 w-3.5 inline" /> na barra do Safari
                    </p>
                  </div>
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Share className="h-5 w-5 text-primary" />
                  </motion.div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Adicionar à Tela de Início</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      Role e toque em <Plus className="h-3 w-3 inline" /> Tela de Início
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Confirme a instalação</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Toque em "Adicionar" no canto superior direito
                    </p>
                  </div>
                </motion.div>
              </div>

              <Button 
                onClick={() => onOpenChange(false)} 
                className="w-full"
              >
                Entendi
              </Button>
            </div>
          ) : (
            // Android/Desktop with beforeinstallprompt
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tenha a melhor experiência com o app instalado:
              </p>

              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Zap className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Acesso Instantâneo</p>
                    <p className="text-xs text-muted-foreground">Abra direto da tela inicial</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Bell className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Notificações</p>
                    <p className="text-xs text-muted-foreground">Receba alertas de novos leads</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Wifi className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Funciona Offline</p>
                    <p className="text-xs text-muted-foreground">Acesse mesmo sem internet</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Depois
                </Button>
                <Button 
                  onClick={handleInstall}
                  className="flex-1"
                >
                  Instalar Agora
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
