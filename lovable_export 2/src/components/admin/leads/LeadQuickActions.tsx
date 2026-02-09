import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, FileText, Trash2 } from "lucide-react";
import { Tables, Enums } from "@/integrations/supabase/types";
import { leadStatusLabels } from "@/hooks/useLeads";

interface LeadQuickActionsProps {
  lead: Tables<"leads">;
  onViewDetails: () => void;
  onStatusChange: (status: Enums<"lead_status">) => void;
  onDelete: () => void;
}

export function LeadQuickActions({
  lead,
  onViewDetails,
  onStatusChange,
  onDelete,
}: LeadQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass border-luma-glass-border">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/proposals/new?leadId=${lead.id}`);
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          Criar Proposta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Mudar status</DropdownMenuLabel>
        {Object.entries(leadStatusLabels).map(([value, label]) => (
          <DropdownMenuItem
            key={value}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(value as Enums<"lead_status">);
            }}
            className={lead.status === value ? "bg-muted/50" : ""}
          >
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
