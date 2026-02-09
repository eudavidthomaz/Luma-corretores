import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, X, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareCategory {
  name: string;
  features: {
    name: string;
    lite: string | boolean;
    pro: string | boolean;
    ultra: string | boolean;
  }[];
}

const compareData: CompareCategory[] = [
  {
    name: "Atendimento IA",
    features: [
      { name: "Luma IA 24h", lite: true, pro: true, ultra: true },
      { name: "Triagem Inteligente", lite: true, pro: true, ultra: true },
      { name: "Memória Cross-Channel", lite: true, pro: true, ultra: true },
      { name: "Personalização de Respostas", lite: true, pro: true, ultra: true },
    ],
  },
  {
    name: "Histórias Narradas",
    features: [
      { name: "Quantidade de Histórias", lite: false, pro: "10", ultra: "30" },
      { name: "Fotos por História", lite: false, pro: "20", ultra: "30" },
      { name: "Suporte a Vídeo", lite: false, pro: false, ultra: true },
      { name: "Narração com IA", lite: false, pro: true, ultra: true },
    ],
  },
  {
    name: "Propostas Inteligentes",
    features: [
      { name: "Propostas/mês", lite: "10", pro: "50", ultra: "∞" },
      { name: "Templates Personalizados", lite: "3", pro: "10", ultra: "∞" },
      { name: "Assinatura Digital", lite: true, pro: true, ultra: true },
      { name: "Comprovante de Pagamento", lite: true, pro: true, ultra: true },
    ],
  },
  {
    name: "Luma Gallery",
    features: [
      { name: "Galerias Simultâneas", lite: false, pro: "5", ultra: "∞" },
      { name: "Armazenamento por Galeria", lite: false, pro: "2GB", ultra: "5GB" },
      { name: "Prazo de Validade", lite: false, pro: "15 dias", ultra: "30 dias" },
      { name: "Download em Lote", lite: false, pro: true, ultra: true },
      { name: "Proteção por Senha", lite: false, pro: true, ultra: true },
    ],
  },
  {
    name: "Mini-Site & Presença",
    features: [
      { name: "Perfil Público", lite: false, pro: false, ultra: true },
      { name: "Carrossel de Portfólio", lite: false, pro: false, ultra: true },
      { name: "Chat Integrado", lite: false, pro: false, ultra: true },
      { name: "White-label (sem marca Luma)", lite: false, pro: false, ultra: true },
    ],
  },
  {
    name: "CRM & Gestão",
    features: [
      { name: "Leads por mês", lite: "50", pro: "200", ultra: "1.000" },
      { name: "Funil Visual", lite: true, pro: true, ultra: true },
      { name: "Indicador de Temperatura", lite: true, pro: true, ultra: true },
      { name: "Histórico de Conversas", lite: true, pro: true, ultra: true },
    ],
  },
];

function renderValue(value: string | boolean) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  }
  if (value === "∞") {
    return <Infinity className="h-5 w-5 text-violet-500 mx-auto" />;
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

export function LandingPricingCompare() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleAll = () => {
    if (isExpanded) {
      setExpandedCategories([]);
    } else {
      setExpandedCategories(compareData.map((c) => c.name));
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      className="mt-8 md:mt-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      viewport={{ once: true }}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleAll}
        className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <span>{isExpanded ? "Esconder comparativo" : "Ver comparativo completo"}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-300",
          isExpanded && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl border border-luma-glass-border mt-6 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 gap-2 p-4 border-b border-luma-glass-border bg-muted/30">
                <div className="text-sm font-medium text-muted-foreground">Recurso</div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-foreground">Lite</span>
                  <p className="text-[10px] text-muted-foreground">R$47/mês</p>
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-primary">Pro</span>
                  <p className="text-[10px] text-muted-foreground">R$97/mês</p>
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-violet-500">Ultra</span>
                  <p className="text-[10px] text-muted-foreground">R$187/mês</p>
                </div>
              </div>

              {/* Categories */}
              {compareData.map((category) => {
                const isCategoryExpanded = expandedCategories.includes(category.name);

                return (
                  <div key={category.name} className="border-b border-luma-glass-border last:border-b-0">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                    >
                      <span className="text-sm font-semibold text-foreground">{category.name}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isCategoryExpanded && "rotate-180"
                      )} />
                    </button>

                    {/* Features */}
                    <AnimatePresence>
                      {isCategoryExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          {category.features.map((feature, i) => (
                            <div
                              key={i}
                              className="grid grid-cols-4 gap-2 px-4 py-3 border-t border-luma-glass-border/50 hover:bg-muted/10 transition-colors"
                            >
                              <div className="text-sm text-muted-foreground pl-4">
                                {feature.name}
                              </div>
                              <div className="text-center">{renderValue(feature.lite)}</div>
                              <div className="text-center">{renderValue(feature.pro)}</div>
                              <div className="text-center">{renderValue(feature.ultra)}</div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
