import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FileText, UserPlus, FolderOpen, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  businessName: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const motivationalPhrases = [
  "Vamos fechar contratos hoje?",
  "Pronto para encantar clientes?",
  "Seu próximo grande projeto espera.",
  "Cada proposta é uma oportunidade.",
  "Hora de criar memórias incríveis.",
];

export function DashboardHeader({ businessName }: DashboardHeaderProps) {
  const greeting = getGreeting();

  const phrase = useMemo(() => {
    const index = Math.floor(Math.random() * motivationalPhrases.length);
    return motivationalPhrases[index];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {greeting}, {businessName || "Imobiliária / Corretor"}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {phrase}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 gap-2 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            <span>Criar Novo</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/admin/proposals/new" className="flex items-center gap-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              Nova Proposta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/admin/leads" className="flex items-center gap-2 cursor-pointer">
              <UserPlus className="h-4 w-4" />
              Cadastrar Lead
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/admin/gallery/new" className="flex items-center gap-2 cursor-pointer">
              <FolderOpen className="h-4 w-4" />
              Nova Vitrine
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/admin/stories/new" className="flex items-center gap-2 cursor-pointer">
              <BookOpen className="h-4 w-4" />
              Novo Imóvel
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
