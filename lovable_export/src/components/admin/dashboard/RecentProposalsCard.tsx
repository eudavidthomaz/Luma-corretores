import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentProposals } from "@/hooks/useRecentProposals";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  sent: { label: "Enviada", variant: "secondary" },
  viewed: { label: "Visualizada", variant: "outline" },
  approved: { label: "Aprovada", variant: "default" },
  signed: { label: "Assinada", variant: "default" },
  paid: { label: "Paga", variant: "default" },
  changes_requested: { label: "Alterações", variant: "destructive" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

export function RecentProposalsCard() {
  const { user } = useAuth();
  const { data: proposals, isLoading } = useRecentProposals(user?.id);

  const formatCurrency = (value: number | null) => {
    if (!value) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bento-card h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Propostas Recentes</h3>
        </div>
        <Link
          to="/admin/proposals"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : proposals && proposals.length > 0 ? (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const status = statusConfig[proposal.status] || { label: proposal.status, variant: "secondary" as const };
            return (
              <Link
                key={proposal.id}
                to={`/admin/proposals/${proposal.id}`}
                className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {proposal.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {proposal.lead?.name || "Sem lead vinculado"}
                    </p>
                  </div>
                  <Badge variant={status.variant} className="shrink-0 text-[10px]">
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {proposal.updated_at &&
                      formatDistanceToNow(new Date(proposal.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(proposal.total_amount)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-full bg-primary/10 mb-3">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Nenhuma proposta enviada ainda
          </p>
          <Link
            to="/admin/proposals/new"
            className="text-xs text-primary hover:underline font-medium"
          >
            Criar primeira proposta →
          </Link>
        </div>
      )}
    </motion.div>
  );
}
