import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

type Proposal = Tables<"proposals">;
type ProposalInsert = TablesInsert<"proposals">;
type ProposalUpdate = TablesUpdate<"proposals">;
type ProposalItem = Tables<"proposal_items">;
type ProposalItemInsert = TablesInsert<"proposal_items">;

export type ProposalStatus = Enums<"proposal_status">;

export interface ProposalWithItems extends Proposal {
  proposal_items: ProposalItem[];
  lead?: Tables<"leads"> | null;
}

export function useProposals(profileId?: string) {
  return useQuery({
    queryKey: ["proposals", profileId],
    queryFn: async () => {
      if (!profileId) {
        console.warn("useProposals: profileId não fornecido");
        return [];
      }
      
      console.log("🔍 Buscando propostas para profile_id:", profileId);
      
      const { data, error } = await supabase
        .from("proposals")
        .select(`
          *,
          proposal_items (*),
          lead:leads (*)
        `)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("❌ Erro ao buscar propostas:", error);
        console.error("   Código:", error.code);
        console.error("   Detalhes:", error.details);
        console.error("   Hint:", error.hint);
        // Re-throw com mensagem mais clara
        throw new Error(`Erro ao carregar propostas: ${error.message}${error.code ? ` (${error.code})` : ""}`);
      }
      
      console.log("✅ Propostas encontradas:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("   IDs:", data.map(p => p.id));
        console.log("   Títulos:", data.map(p => p.title));
      }
      
      // Garantir que retornamos array mesmo se data for null
      return (data || []) as ProposalWithItems[];
    },
    enabled: !!profileId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 30, // 30 seconds
    retry: 2,
  });
}

export function useProposal(proposalId?: string) {
  return useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: async () => {
      if (!proposalId) return null;
      
      const { data, error } = await supabase
        .from("proposals")
        .select(`
          *,
          proposal_items (*),
          lead:leads (*)
        `)
        .eq("id", proposalId)
        .single();
      
      if (error) throw error;
      
      return data as ProposalWithItems;
    },
    enabled: !!proposalId,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proposal: ProposalInsert) => {
      if (!proposal.profile_id) {
        throw new Error("profile_id é obrigatório para criar proposta");
      }
      
      const { data, error } = await supabase
        .from("proposals")
        .insert(proposal)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao criar proposta:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Proposta criada mas nenhum dado retornado");
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", data.id] });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProposalUpdate & { id: string }) => {
      if (!id) {
        throw new Error("ID da proposta é obrigatório para atualizar");
      }
      
      const { data, error } = await supabase
        .from("proposals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao atualizar proposta:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Proposta atualizada mas nenhum dado retornado");
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", variables.id] });
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase
        .from("proposals")
        .delete()
        .eq("id", proposalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

// Proposal Items hooks
export function useAddProposalItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: ProposalItemInsert) => {
      const { data, error } = await supabase
        .from("proposal_items")
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", variables.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

export function useUpdateProposalItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, proposal_id, ...updates }: { id: string; proposal_id: string } & Partial<ProposalItem>) => {
      const { data, error } = await supabase
        .from("proposal_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, proposal_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", data.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

export function useDeleteProposalItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, proposal_id }: { id: string; proposal_id: string }) => {
      const { error } = await supabase
        .from("proposal_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { proposal_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", data.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

// Update proposal total based on items
export function useRecalculateProposalTotal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proposalId: string) => {
      // Get all items for this proposal
      const { data: items, error: itemsError } = await supabase
        .from("proposal_items")
        .select("quantity, unit_price")
        .eq("proposal_id", proposalId);
      
      if (itemsError) throw itemsError;
      
      // Calculate total
      const total = items.reduce((sum, item) => {
        return sum + (item.quantity || 1) * Number(item.unit_price);
      }, 0);
      
      // Update proposal
      const { data, error } = await supabase
        .from("proposals")
        .update({ total_amount: total })
        .eq("id", proposalId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, proposalId) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

// Status display helpers
export const proposalStatusLabels: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  viewed: "Visualizada",
  approved: "Aprovada",
  changes_requested: "Alteração Solicitada",
  signed: "Assinada",
  paid: "Paga",
  cancelled: "Cancelada",
};

export const proposalStatusColors: Record<ProposalStatus, string> = {
  draft: "bg-muted text-muted-foreground border-muted",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  viewed: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  changes_requested: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  signed: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};
