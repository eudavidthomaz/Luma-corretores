import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MinisiteTheme } from "@/components/minisite/MinisiteThemeProvider";
import { cn } from "@/lib/utils";

interface ContactSectionProps {
  onChatClick: () => void;
  whatsappNumber?: string | null;
  businessName: string;
  theme?: MinisiteTheme;
}

export function ContactSection({ onChatClick, whatsappNumber, businessName, theme = 'dark' }: ContactSectionProps) {
  const isEditorial = theme === 'editorial';

  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}`, "_blank", "noopener,noreferrer");
    }
  };

  // Conditional classes based on theme
  const sectionBgClasses = isEditorial
    ? "bg-gradient-to-b from-background to-[hsl(35_30%_92%)/50]"
    : "bg-gradient-to-b from-background to-muted/50";

  const ctaBtnClasses = isEditorial
    ? "bg-gradient-to-r from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)] hover:from-[hsl(43_50%_52%)] hover:to-[hsl(37_52%_36%)] shadow-xl shadow-[hsl(43_50%_57%)/30]"
    : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/30";

  return (
    <section id="contato" className={`py-20 px-6 ${sectionBgClasses}`}>
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Section Title */}
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold text-foreground mb-4",
            isEditorial && "font-editorial"
          )}>
            Vamos Conversar?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Estou à disposição para tirar suas dúvidas e criar algo especial para você.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4">
            {/* Primary: Chat with Luma */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={onChatClick}
                size="lg"
                className={`w-full h-14 text-white rounded-2xl text-base font-semibold gap-3 ${ctaBtnClasses}`}
              >
                <Sparkles className="h-5 w-5" />
                Falar com a Luma
              </Button>
            </motion.div>

            {/* Secondary: WhatsApp Direct */}
            {whatsappNumber && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleWhatsAppClick}
                  variant="outline"
                  size="lg"
                  className="w-full h-12 border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-xl text-sm font-medium gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Direto
                </Button>
              </motion.div>
            )}
          </div>

          {/* Trust Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-xs text-muted-foreground/60"
          >
            Resposta rápida • Atendimento personalizado
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
