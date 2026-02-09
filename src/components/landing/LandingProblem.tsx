import { motion } from "framer-motion";
import { Clock, MessageSquareX, TrendingDown, Ghost } from "lucide-react";

const painPoints = [
  {
    icon: Ghost,
    title: "O Lead Frio",
    description:
      "O cliente vê o imóvel no portal, manda mensagem querendo visitar. Você demorou 1 hora para responder. Ele já falou com outro corretor.",
    stat: "50%",
    statLabel: "desistem se demorar"
  },
  {
    icon: MessageSquareX,
    title: "A Agenda Furada",
    description:
      "Você para seu dia, atravessa a cidade para mostrar um imóvel e o cliente não aparece. Ou pior: ele não tinha o perfil financeiro para compra.",
    stat: "15h",
    statLabel: "perdidas/mês"
  },
  {
    icon: TrendingDown,
    title: "O Portfólio Estático",
    description:
      "Seus imóveis são incríveis, mas no PDF ou WhatsApp eles parecem comuns. Sem emoção, sem vídeo, sem tour. Só preço e metro quadrado.",
    stat: "80%",
    statLabel: "menos percepção de valor"
  }
];

export function LandingProblem() {
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
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-destructive font-medium">
            O Problema
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 md:mt-4 mb-4">
            O pesadelo do corretor moderno
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Você conhece o mercado, mas está preso no operacional. Enquanto mostra, não capta. Enquanto digita, perde venda.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {painPoints.map((pain, index) => (
            <motion.div
              key={index}
              className="glass rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-destructive/20 hover:border-destructive/40 hover:translate-y-[-2px] transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-destructive/10 w-fit">
                  <pain.icon className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
                </div>
                <div className="text-right">
                  <span className="text-2xl md:text-3xl font-bold text-destructive">
                    {pain.stat}
                  </span>
                  <p className="text-xs text-muted-foreground">{pain.statLabel}</p>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
                {pain.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {pain.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Amplification */}
        <motion.div
          className="mt-8 md:mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-sm md:text-base text-muted-foreground italic">
            "Cada minuto que você passa respondendo DMs manualmente é um cliente que{" "}
            <span className="text-foreground font-medium">o concorrente automatizado</span> está fechando."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
