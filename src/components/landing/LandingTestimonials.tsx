import { motion } from "framer-motion";
import { Star, TrendingUp, Clock, Wallet } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  handle: string;
  niche: string;
  avatar: string;
  result: {
    icon: React.ElementType;
    value: string;
    label: string;
  };
}

const testimonials: Testimonial[] = [
  {
    quote: "Fechei 3x mais casamentos no primeiro mês. A Luma conta a história do meu trabalho melhor do que eu.",
    name: "Ana Paula Ferreira",
    handle: "@anapaulafotos",
    niche: "Casamentos • SP",
    avatar: "A",
    result: {
      icon: TrendingUp,
      value: "+180%",
      label: "conversão",
    },
  },
  {
    quote: "A Luma responde enquanto eu durmo. Não perco mais leads de 2h da manhã querendo orçamento.",
    name: "Ricardo Mendes",
    handle: "@ricardofotografia",
    niche: "Newborn • RJ",
    avatar: "R",
    result: {
      icon: Clock,
      value: "+15h",
      label: "livres/mês",
    },
  },
  {
    quote: "Meus clientes elogiam as histórias antes de saber o preço. O ticket médio subiu demais.",
    name: "Juliana Costa",
    handle: "@julianacostafoto",
    niche: "Família • MG",
    avatar: "J",
    result: {
      icon: Wallet,
      value: "+40%",
      label: "ticket médio",
    },
  },
];

export function LandingTestimonials() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-medium">
            Resultados Reais
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3 md:mt-4 mb-4">
            Fotógrafos que transformaram seus negócios
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como a Luma está ajudando fotógrafos a fechar mais contratos e economizar tempo.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="glass rounded-2xl p-6 border border-luma-glass-border hover:border-primary/30 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground text-sm md:text-base leading-relaxed mb-6 min-h-[80px]">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.handle}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.niche}</p>
                </div>
              </div>

              {/* Result Badge */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <testimonial.result.icon className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-green-500">{testimonial.result.value}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.result.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Note */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          viewport={{ once: true }}
        >
          * Resultados reais de clientes. Resultados individuais podem variar.
        </motion.p>
      </div>
    </section>
  );
}
