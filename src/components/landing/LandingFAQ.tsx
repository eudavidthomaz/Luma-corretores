import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Code, 
  Clock, 
  RefreshCw, 
  MessageSquare, 
  ArrowUpDown,
  Camera,
  Bot,
  Headphones
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ElementType;
}

const faqItems: FAQItem[] = [
  {
    question: "Preciso saber programar?",
    answer: "Não! A Luma foi criada para fotógrafos, não para programadores. Em 15 minutos você configura tudo: sobe suas histórias, personaliza as respostas e pronto. Se você sabe usar Instagram, sabe usar a Luma.",
    icon: Code,
  },
  {
    question: "Quanto tempo leva para configurar?",
    answer: "Em média, 15 minutos. Você só precisa: criar sua conta, subir algumas fotos para as histórias, e personalizar a mensagem inicial. A Luma já vem pré-configurada com as melhores práticas de atendimento para fotógrafos.",
    icon: Clock,
  },
  {
    question: "E se eu não gostar?",
    answer: "Você cancela quando quiser, em 1 clique. Não tem fidelidade, não tem multa, não tem pegadinha. Se a Luma não fizer sentido para você, é só cancelar. Simples assim.",
    icon: RefreshCw,
  },
  {
    question: "A Luma responde exatamente como eu?",
    answer: "A Luma aprende com as instruções que você fornece. Você define o tom, as regras, o que ela pode ou não falar. Com o tempo, ela fica cada vez mais alinhada com seu estilo de atendimento.",
    icon: MessageSquare,
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. Se fizer upgrade, o valor é proporcional ao período restante. Se fizer downgrade, a mudança vale a partir do próximo ciclo de cobrança.",
    icon: ArrowUpDown,
  },
  {
    question: "Funciona para meu nicho (Newborn, Casamento, etc)?",
    answer: "Funciona para qualquer nicho de fotografia: Casamento, Newborn, Família, Corporativo, Moda, Gastronomia, Gestante, Eventos e mais. A Luma é treinada especificamente para o mercado de fotografia brasileiro.",
    icon: Camera,
  },
  {
    question: "Meus clientes vão perceber que é uma IA?",
    answer: "A Luma foi desenvolvida para ter conversas naturais e humanizadas. Ela não responde de forma robótica, usa emojis, conta histórias e cria conexão. A maioria dos clientes nem percebe que é uma IA.",
    icon: Bot,
  },
  {
    question: "E se eu tiver dúvidas?",
    answer: "Você tem acesso a suporte dedicado via WhatsApp. Além disso, nossa comunidade no Discord tem milhares de fotógrafos trocando experiências e dicas. Você nunca está sozinho.",
    icon: Headphones,
  },
];

export function LandingFAQ() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-medium">
            Dúvidas Frequentes
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3 md:mt-4 mb-4">
            Tudo que você precisa saber
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Respostas para as perguntas mais comuns sobre a Luma.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass rounded-xl border border-luma-glass-border px-4 sm:px-6 overflow-hidden"
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-foreground">
                      {item.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-12">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground">
            Ainda tem dúvidas?{" "}
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Fale conosco no WhatsApp
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
