import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, UserPlus, FolderOpen, Sparkles, LucideIcon } from "lucide-react";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  to: string;
  gradient: string;
}

const quickActions: QuickAction[] = [
  {
    icon: FileText,
    label: "Nova Proposta",
    description: "Criar proposta comercial",
    to: "/admin/proposals/new",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: UserPlus,
    label: "Cadastrar Lead",
    description: "Adicionar novo contato",
    to: "/admin/leads",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: FolderOpen,
    label: "Nova Vitrine",
    description: "Cadastrar apresentação de imóvel",
    to: "/admin/gallery/new",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Sparkles,
    label: "Configurar Luma",
    description: "Ajustar IA de vendas",
    to: "/admin/settings",
    gradient: "from-pink-500 to-rose-600",
  },
];

export function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {quickActions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link to={action.to}>
            <div className="quick-action-card group h-full">
              <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${action.gradient} mb-3`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {action.description}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
