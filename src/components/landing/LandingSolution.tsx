import { motion, MotionValue } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import lumaLogoWhite from "@/assets/luma-logo-white.png";

interface LandingSolutionProps {
  iphoneY: MotionValue<number>;
}

const chatMessages = [
  { role: "luma", text: "Olá! 🏠 Vi que você gostou do Apartamento no Jardins! Quer agendar uma visita?", delay: 0.3 },
  { role: "user", text: "Oi! Gostei sim, mas queria saber o valor do condomínio antes.", delay: 0.5 },
  { role: "luma", text: "O condomínio é R$ 1.200/mês. O prédio tem piscina aquecida e academia 24h! Quer ver o vídeo do lazer?", delay: 0.7 },
  { role: "luma", text: "[Enviando tour virtual do condomínio...]", delay: 0.9, isAction: true }
];

const benefits = [
  { id: 1, text: "Responde 24h, agendando visitas automaticamente" },
  { id: 2, text: "Qualifica leads perguntando renda e momento de compra" },
  { id: 3, text: "Envia tours e vídeos antes de você gastar gasolina" },
  { id: 4, text: "Só te notifica quando o lead quer visitar ou fazer proposta" }
];

export function LandingSolution({ iphoneY }: LandingSolutionProps) {
  const navigate = useNavigate();

  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 py-16 md:py-32 min-h-[85vh] md:min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* iPhone Mockup */}
          <motion.div
            className="relative order-2 lg:order-1"
            style={{ y: iphoneY }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="relative mx-auto w-[240px] sm:w-[280px] md:w-[320px]">
              {/* Phone Frame */}
              <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[2.5rem] md:rounded-[3rem] p-2 md:p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-5 md:h-7 bg-zinc-900 rounded-b-2xl md:rounded-b-3xl z-20" />

                {/* Screen */}
                <div className="bg-background rounded-[2rem] md:rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  <div className="p-3 md:p-4 pt-8 md:pt-10 h-full flex flex-col">
                    {/* Chat Header */}
                    <div className="flex items-center gap-2 md:gap-3 pb-3 md:pb-4 border-b border-luma-glass-border">
                      <img src={lumaLogoWhite} alt="Luma" className="h-8 md:h-10 w-auto" />
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] md:text-xs text-secondary">Online agora</p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 py-3 md:py-4 space-y-2 md:space-y-3 overflow-hidden">
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          className={`rounded-xl md:rounded-2xl p-2 md:p-3 max-w-[88%] ${msg.role === "user"
                            ? "ml-auto bg-primary/20 rounded-br-sm"
                            : "glass rounded-bl-sm"
                            }`}
                          initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: msg.delay, duration: 0.4, ease: "easeOut" }}
                          viewport={{ once: true }}
                        >
                          <p className={`text-[10px] md:text-xs ${msg.isAction ? "text-secondary italic" : "text-foreground"}`}>
                            {msg.text}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Result indicator */}
                    <motion.div
                      className="py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 1.1, duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <p className="text-[9px] md:text-[10px] text-green-400">
                        ✓ Lead qualificado! Pronta para fechar
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[3rem] md:rounded-[4rem] blur-2xl md:blur-3xl -z-10" />
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            className="order-1 lg:order-2 text-center lg:text-left"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-secondary font-medium">
              A Solução
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 md:mt-4 mb-4 md:mb-6 leading-tight">
              Conheça a <span className="gradient-text">Luma</span>
              <br />
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-muted-foreground">
                Sua secretária imobiliária que nunca dorme
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 md:mb-8">
              A Luma não é um chatbot burro. É uma <span className="text-foreground font-medium">assistente comercial</span> treinada
              para vender imóveis. Ela apresenta, tira dúvidas de condomínio, <span className="text-foreground font-medium">qualifica o cliente</span> e agenda a visita direto na sua agenda.
            </p>

            <ul className="space-y-3 mb-8 text-left max-w-md mx-auto lg:mx-0">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit.id}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-foreground">{benefit.text}</span>
                </motion.li>
              ))}
            </ul>

            <Button
              variant="glass"
              size="lg"
              onClick={() => navigate("/auth")}
              className="gap-2 hover:scale-[1.02] transition-all duration-300 touch-target"
            >
              <Sparkles className="h-4 w-4" />
              Ver Luma em Ação
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
