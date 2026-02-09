import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone, Clock, Calendar, MapPin, Flame } from "lucide-react";
import { Tables, Enums } from "@/integrations/supabase/types";
import { leadStatusLabels } from "@/hooks/useLeads";
import { useCategoryById } from "@/hooks/useCategories";
import { LeadQuickActions } from "./LeadQuickActions";
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

interface LeadsDataTableProps {
  leads: Tables<"leads">[];
  onLeadClick: (lead: Tables<"leads">) => void;
  onStatusChange: (leadId: string, status: Enums<"lead_status">) => void;
  onDelete: (leadId: string) => void;
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

export function LeadsDataTable({
  leads,
  onLeadClick,
  onStatusChange,
  onDelete,
  className,
}: LeadsDataTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn("glass rounded-2xl border border-luma-glass-border overflow-hidden", className)}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-luma-glass-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium w-10"></TableHead>
            <TableHead className="text-muted-foreground font-medium">Lead</TableHead>
            <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">
              Dados Coletados
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">Completude</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => (
            <motion.tr
              key={lead.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              className={cn(
                "border-luma-glass-border hover:bg-luma-glass transition-colors cursor-pointer",
                lead.heat_level === "hot" && "bg-orange-500/5"
              )}
              onClick={() => onLeadClick(lead)}
            >
              <TableCell className="text-center">{getHeatIcon(lead.heat_level)}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {lead.name || <span className="text-muted-foreground italic">Sem nome</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {lead.whatsapp && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.whatsapp}
                      </span>
                    )}
                    {lead.last_interaction_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(lead.last_interaction_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1.5 max-w-xs">
                  {lead.service_type && (
                    <Badge variant="outline" className="text-xs">
                      {lead.service_type}
                    </Badge>
                  )}
                  {lead.event_date && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {lead.event_date}
                    </Badge>
                  )}
                  {lead.event_location && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {lead.event_location}
                    </Badge>
                  )}
                  <CategoryBadge lead={lead} />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={lead.data_completeness || 0} className="h-2 w-16" />
                  <span className="text-xs text-muted-foreground w-8">
                    {lead.data_completeness || 0}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${statusColors[lead.status]} font-medium`}>
                  {leadStatusLabels[lead.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <LeadQuickActions
                  lead={lead}
                  onViewDetails={() => onLeadClick(lead)}
                  onStatusChange={(status) => onStatusChange(lead.id, status)}
                  onDelete={() => onDelete(lead.id)}
                />
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
