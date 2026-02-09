import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Sun, Users, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useHotLeads } from "@/hooks/useHotLeads";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  novo: "Novo",
  qualificando: "Qualificando",
  engajado: "Engajado",
  pronto: "Pronto",
  em_contato: "Em contato",
  proposta_enviada: "Proposta enviada",
  convertido: "Convertido",
  perdido: "Perdido",
};

export function HotLeadsCard() {
  const { user } = useAuth();
  const { data: leads, isLoading } = useHotLeads(user?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bento-card h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <h3 className="font-semibold text-foreground">Leads Quentes</h3>
        </div>
        <Link
          to="/admin/leads"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : leads && leads.length > 0 ? (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              to="/admin/leads"
              className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  lead.heat_level === "hot" 
                    ? "bg-orange-500/20" 
                    : "bg-amber-500/20"
                }`}>
                  {lead.heat_level === "hot" ? (
                    <Flame className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground text-sm truncate">
                      {lead.name || "Lead sem nome"}
                    </p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {statusLabels[lead.status] || lead.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {lead.service_type || "Serviço não definido"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(lead.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-full bg-orange-500/10 mb-3">
            <Users className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Nenhum lead quente no momento
          </p>
          <p className="text-xs text-muted-foreground">
            Leads com alta interação aparecem aqui
          </p>
        </div>
      )}
    </motion.div>
  );
}
