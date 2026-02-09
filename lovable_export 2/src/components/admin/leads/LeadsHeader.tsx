import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface LeadsHeaderProps {
  totalLeads: number;
  newLeadsThisWeek: number;
}

export function LeadsHeader({ totalLeads, newLeadsThisWeek }: LeadsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Leads</h1>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {totalLeads}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {newLeadsThisWeek > 0 ? (
          <span className="text-primary font-medium">{newLeadsThisWeek} novos esta semana</span>
        ) : (
          "Capturados automaticamente pela Luma"
        )}
      </p>
    </motion.div>
  );
}
