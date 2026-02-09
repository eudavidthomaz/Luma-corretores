import { motion } from "framer-motion";
import { BookOpen, Shield, Images, Globe, Brain, BarChart3 } from "lucide-react";

const pillars = [
  {
    icon: BookOpen,
    title: "Storytelling Automático",
    subtitle: "Suas fotos não falam sozinhas",
    description:
      "A Luma transforma cada álbum em uma narrativa imersiva. O cliente sente o casamento, o ensaio, a emoção — antes de saber o preço.",
    gradient: "from-primary to-purple-600"
  },
  {
    icon: Shield,
    title: "Triagem Inteligente",
    subtitle: "Chega de curiosos",
    description:
      "A Luma qualifica cada lead: pergunta data, local, orçamento... e só te notifica quando o cliente está pronto para fechar.",
    gradient: "from-secondary to-cyan-600"
  },
  {
    icon: Brain,
    title: "Memória Cross-Channel",
    subtitle: "Ela lembra de tudo",
    description:
      "Se o mesmo cliente voltar do Instagram, WhatsApp ou site, ela sabe quem é, o que conversaram, e retoma de onde parou.",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    icon: Images,
    title: "Luma Gallery",
    subtitle: "Entrega de luxo",
    description:
      "Galerias com prazo de validade que criam urgência, proteção por senha e download em lote. Zero armazenamento eterno, máxima conversão.",
    gradient: "from-emerald-500 to-green-600"
  },
  {
    icon: Globe,
    title: "Mini-Site Público",
    subtitle: "Seu portfólio profissional",
    description:
      "Um site personalizado com suas histórias, pacotes e integração direta com a Luma. Pronto para compartilhar no bio do Instagram.",
    gradient: "from-rose-500 to-pink-600"
  },
  {
    icon: BarChart3,
    title: "CRM Visual",
    subtitle: "Funil de vendas completo",
    description:
      "Visualize todos os seus leads em um funil intuitivo. Veja quem está quente, quem esfriou e quem precisa de follow-up.",
    gradient: "from-indigo-500 to-blue-600"
  }
];

export function LandingPillars() {
  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 py-16 md:py-32 min-h-[85vh] md:min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-medium">
            Arsenal Completo
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 md:mt-4 mb-4">
            Tudo que você precisa para escalar
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Não é só um chatbot. É um ecossistema completo de vendas visuais, desenvolvido por quem entende o mercado de fotografia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              className="glass rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-luma-glass-border hover:border-primary/30 hover:translate-y-[-2px] transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${pillar.gradient} w-fit mb-4 group-hover:shadow-lg transition-shadow duration-300`}>
                <pillar.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {pillar.subtitle}
              </p>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
