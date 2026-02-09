import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Phone, Clock, Calendar, MapPin, Flame, Eye } from "lucide-react";
import { Tables, Enums } from "@/integrations/supabase/types";
import { leadStatusLabels } from "@/hooks/useLeads";
import { useCategoryById } from "@/hooks/useCategories";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusColors: Record<Enums<"lead_status">, string> = {
  novo: "bg-primary/20 text-primary border-primary/30",
  qualificando: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  engajado: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  em_contato: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  proposta_enviada: "bg-secondary/20 text-secondary border-secondary/30",
  pronto: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  convertido: "bg-green-500/20 text-green-400 border-green-500/30",
  perdido: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface LeadsMobileCardsProps {
  leads: Tables<"leads">[];
  onLeadClick: (lead: Tables<"leads">) => void;
  className?: string;
}

// Helper component for category badge
function CategoryBadge({ lead }: { lead: Tables<"leads"> }) {
  const category = useCategoryById(lead.interest_category_id || null);

  if (category) {
    return (
      <Badge className={`bg-${category.color}-500/20 text-${category.color}-400 border-0 text-xs`}>
        {category.name}
      </Badge>
    );
  }

  if (lead.interest_category) {
    return (
      <Badge className="bg-muted/50 text-muted-foreground border-0 text-xs">
        {lead.interest_category}
      </Badge>
    );
  }

  return null;
}

const getHeatIcon = (heatLevel: string | null | undefined) => {
  if (heatLevel === "hot") return <Flame className="h-4 w-4 text-orange-400" />;
  if (heatLevel === "warm") return <Flame className="h-4 w-4 text-yellow-400" />;
  return <Flame className="h-4 w-4 text-blue-400 opacity-50" />;
};

const getHeatCardClass = (heatLevel: string | null | undefined) => {
  if (heatLevel === "hot") return "border-l-4 border-l-orange-500/60";
  if (heatLevel === "warm") return "border-l-4 border-l-yellow-500/60";
  return "";
};

export function LeadsMobileCards({ leads, onLeadClick, className }: LeadsMobileCardsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {leads.map((lead, index) => (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + index * 0.03 }}
          onClick={() => onLeadClick(lead)}
          className={cn(
            "glass rounded-xl border border-luma-glass-border p-4 space-y-3",
            "cursor-pointer hover:bg-luma-glass transition-colors",
            getHeatCardClass(lead.heat_level)
          )}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getHeatIcon(lead.heat_level)}
              <div>
                <p className="font-medium text-foreground">
                  {lead.name || <span className="text-muted-foreground italic">Sem nome</span>}
                </p>
                {lead.whatsapp && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lead.whatsapp}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline" className={`${statusColors[lead.status]} font-medium text-xs`}>
              {leadStatusLabels[lead.status]}
            </Badge>
          </div>

          {/* Collected Data */}
          <div className="flex flex-wrap gap-1.5">
            {lead.service_type && (
              <Badge variant="outline" className="text-xs">
                {lead.service_type}
              </Badge>
            )}
            {lead.event_date && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {lead.event_date}
              </Badge>
            )}
            {lead.event_location && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {lead.event_location}
              </Badge>
            )}
            <CategoryBadge lead={lead} />
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between pt-2 border-t border-luma-glass-border">
            <div className="flex items-center gap-2 flex-1">
              <Progress value={lead.data_completeness || 0} className="h-1.5 flex-1 max-w-[80px]" />
              <span className="text-xs text-muted-foreground">
                {lead.data_completeness || 0}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              {lead.last_interaction_at && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(lead.last_interaction_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onLeadClick(lead);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                Ver
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
