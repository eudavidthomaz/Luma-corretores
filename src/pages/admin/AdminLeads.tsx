import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads, useUpdateLead, useDeleteLead, leadStatusLabels } from "@/hooks/useLeads";
import { useFunnelStats } from "@/hooks/useFunnelStats";
import { useCategoryGroupsWithCategories } from "@/hooks/useCategories";
import { useFilteredLeads, LeadFilters, defaultLeadFilters } from "@/hooks/useFilteredLeads";
import { useHeatBreakdown } from "@/hooks/useHeatBreakdown";
import { Tables, Enums } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  LeadsHeader,
  LeadsFunnelStages,
  LeadsSmartFilter,
  LeadsDataTable,
  LeadsMobileCards,
  LeadDetailsSheet,
  LeadsListSkeleton,
} from "@/components/admin/leads";

function countNewThisWeek(leads: Tables<"leads">[] | undefined): number {
  if (!leads) return 0;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return leads.filter((lead) => new Date(lead.created_at) > oneWeekAgo).length;
}

export default function AdminLeads() {
  const { user } = useAuth();
  const { data: leads, isLoading } = useLeads(user?.id);
  const { data: funnelStats } = useFunnelStats(user?.id);
  const { data: categoryGroups } = useCategoryGroupsWithCategories();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const [filters, setFilters] = useState<LeadFilters>(defaultLeadFilters);
  const [selectedLead, setSelectedLead] = useState<Tables<"leads"> | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredLeads = useFilteredLeads(leads, filters);
  const heatBreakdown = useHeatBreakdown(leads);
  const newLeadsThisWeek = countNewThisWeek(leads);

  const handleStatusChange = async (leadId: string, newStatus: Enums<"lead_status">) => {
    await updateLead.mutateAsync({ id: leadId, status: newStatus });
    toast({ title: `Status atualizado para ${leadStatusLabels[newStatus]}` });
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;

    setIsDeleting(true);
    try {
      await deleteLead.mutateAsync(leadToDelete);
      toast({ title: "Lead excluído" });
      setLeadToDelete(null);
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilters(defaultLeadFilters);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasResults = filteredLeads.length > 0;
  const hasActiveFilters =
    filters.search || filters.heat !== "all" || filters.status !== "all" || filters.category !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <LeadsHeader totalLeads={leads?.length || 0} newLeadsThisWeek={newLeadsThisWeek} />

      {/* Funnel Stages */}
      <LeadsFunnelStages stages={funnelStats?.stages || []} />

      {/* Smart Filter */}
      <LeadsSmartFilter
        filters={filters}
        onFiltersChange={setFilters}
        heatBreakdown={heatBreakdown}
        categoryGroups={categoryGroups}
      />

      {/* Data Table / Cards */}
      {hasResults ? (
        <>
          <LeadsDataTable
            leads={filteredLeads}
            onLeadClick={setSelectedLead}
            onStatusChange={handleStatusChange}
            onDelete={setLeadToDelete}
            className="hidden md:block"
          />
          <LeadsMobileCards
            leads={filteredLeads}
            onLeadClick={setSelectedLead}
            className="md:hidden"
          />
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 glass rounded-2xl border border-luma-glass-border"
        >
          {hasActiveFilters ? (
            <>
              <p className="text-xl font-medium text-foreground mb-2">Nenhum resultado encontrado</p>
              <p className="text-muted-foreground mb-4">Tente ajustar os filtros de busca</p>
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </>
          ) : (
            <>
              <p className="text-xl font-medium text-foreground mb-2">Nenhum lead ainda</p>
              <p className="text-muted-foreground">
                Os leads aparecerão aqui quando visitantes interagirem com a Luma
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* Lead Details Sheet */}
      <LeadDetailsSheet
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent className="glass border-luma-glass-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O lead será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
