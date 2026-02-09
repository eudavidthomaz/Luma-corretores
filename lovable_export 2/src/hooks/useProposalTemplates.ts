import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ProposalTemplate = Tables<"proposal_templates">;
type ProposalTemplateInsert = TablesInsert<"proposal_templates">;
type ProposalTemplateUpdate = TablesUpdate<"proposal_templates">;

export function useProposalTemplates(profileId?: string) {
  return useQuery({
    queryKey: ["proposal-templates", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from("proposal_templates")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data as ProposalTemplate[];
    },
    enabled: !!profileId,
  });
}

export function useProposalTemplate(templateId?: string) {
  return useQuery({
    queryKey: ["proposal-template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      const { data, error } = await supabase
        .from("proposal_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      
      if (error) throw error;
      
      return data as ProposalTemplate;
    },
    enabled: !!templateId,
  });
}

export function useCreateProposalTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: ProposalTemplateInsert) => {
      const { data, error } = await supabase
        .from("proposal_templates")
        .insert(template)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposal-templates"] });
    },
  });
}

export function useUpdateProposalTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProposalTemplateUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("proposal_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proposal-templates"] });
      queryClient.invalidateQueries({ queryKey: ["proposal-template", variables.id] });
    },
  });
}

export function useDeleteProposalTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("proposal_templates")
        .delete()
        .eq("id", templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposal-templates"] });
    },
  });
}

// Interface for proposal items (updated with new fields)
export interface ProposalItem {
  name: string;           // Nome curto do item
  description?: string;   // Mantido para compatibilidade
  details?: string;       // Descrição longa
  quantity: number;
  unit_price: number;
  show_price: boolean;    // Se deve exibir o preço
}

// Default variables available for contracts
export const defaultContractVariables = [
  { key: "nome_cliente", label: "Nome do Cliente", placeholder: "João da Silva" },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { key: "rg", label: "RG", placeholder: "00.000.000-0" },
  { key: "endereco", label: "Endereço", placeholder: "Rua das Flores, 123" },
  { key: "cidade", label: "Cidade", placeholder: "São Paulo" },
  { key: "estado", label: "Estado", placeholder: "SP" },
  { key: "cep", label: "CEP", placeholder: "00000-000" },
  { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
  { key: "email", label: "E-mail", placeholder: "cliente@email.com" },
  { key: "data_evento", label: "Data do Evento", placeholder: "01/01/2025" },
  { key: "local_evento", label: "Local do Evento", placeholder: "Espaço Festas" },
  { key: "horario_evento", label: "Horário do Evento", placeholder: "16:00" },
  { key: "valor_total", label: "Valor Total", placeholder: "R$ 5.000,00" },
  { key: "data_assinatura", label: "Data de Assinatura", placeholder: "01/01/2025" },
  { key: "itens_proposta", label: "Itens/Serviços da Proposta", placeholder: "Lista de serviços contratados", isSpecial: true },
  // Video-specific variables
  { key: "revision_limit", label: "Rodadas de Revisão", placeholder: "3", isVideo: true },
  { key: "delivery_formats", label: "Formatos de Entrega", placeholder: "16:9, 9:16", isVideo: true },
  { key: "estimated_duration", label: "Duração Estimada (min)", placeholder: "3", isVideo: true },
  { key: "project_format", label: "Formato do Projeto", placeholder: "4K Horizontal", isVideo: true },
];

// Extract variables from contract content
export function extractVariablesFromContent(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = content.matchAll(regex);
  const variables = new Set<string>();
  
  for (const match of matches) {
    variables.add(match[1].trim());
  }
  
  return Array.from(variables);
}

// Format currency for display
function formatCurrencyForContract(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Generate items table for contract (updated with new fields)
export function generateItemsTable(items: ProposalItem[]): string {
  if (!items || items.length === 0) {
    return "Serviços conforme proposta comercial.";
  }
  
  let table = "SERVIÇOS CONTRATADOS:\n";
  table += "━".repeat(50) + "\n\n";
  
  items.forEach((item, index) => {
    // Use name or fallback to description for backwards compatibility
    const itemName = item.name || item.description || "Item";
    table += `${index + 1}. ${itemName}\n`;
    
    // Add details if present
    if (item.details) {
      table += `   ${item.details}\n`;
    }
    
    // Show price or "Incluso" based on show_price flag
    const showPrice = item.show_price !== false; // Default to true for backwards compatibility
    if (showPrice) {
      const itemTotal = (item.quantity || 1) * (item.unit_price || 0);
      table += `   Quantidade: ${item.quantity || 1} | Valor: ${formatCurrencyForContract(itemTotal)}\n`;
    } else {
      table += `   Quantidade: ${item.quantity || 1} | Incluso no pacote\n`;
    }
    
    table += "\n";
  });
  
  table += "━".repeat(50) + "\n";
  return table;
}

// Video-specific metadata interface
export interface VideoMetadata {
  revision_limit?: number;
  delivery_formats?: string[];
  estimated_duration_min?: number | null;
  project_format?: string;
}

// Replace variables in content with actual values
export function replaceVariables(
  content: string, 
  data: Record<string, string>,
  items?: ProposalItem[],
  videoMetadata?: VideoMetadata
): string {
  let result = content;
  
  // 1. Replace {{itens_proposta}} first (special variable)
  if (items && items.length > 0) {
    const itemsTable = generateItemsTable(items);
    result = result.replace(
      /\{\{\s*itens_proposta\s*\}\}/gi, 
      itemsTable
    );
  } else {
    // Remove the variable if no items
    result = result.replace(
      /\{\{\s*itens_proposta\s*\}\}/gi, 
      "Serviços conforme proposta comercial."
    );
  }
  
  // 2. Replace video-specific variables
  if (videoMetadata) {
    // Revision limit
    if (videoMetadata.revision_limit !== undefined) {
      result = result.replace(
        /\{\{\s*revision_limit\s*\}\}/gi,
        String(videoMetadata.revision_limit)
      );
    }
    
    // Delivery formats
    if (videoMetadata.delivery_formats && videoMetadata.delivery_formats.length > 0) {
      result = result.replace(
        /\{\{\s*delivery_formats\s*\}\}/gi,
        videoMetadata.delivery_formats.join(", ")
      );
    }
    
    // Estimated duration
    if (videoMetadata.estimated_duration_min) {
      result = result.replace(
        /\{\{\s*estimated_duration\s*\}\}/gi,
        String(videoMetadata.estimated_duration_min)
      );
    }
    
    // Project format
    if (videoMetadata.project_format) {
      result = result.replace(
        /\{\{\s*project_format\s*\}\}/gi,
        videoMetadata.project_format
      );
    }
  }
  
  // 3. Replace normal variables (case-insensitive, with optional spaces)
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    result = result.replace(regex, value || '_______________');
  }
  
  // 4. Mark unfilled variables
  result = result.replace(/\{\{[^}]+\}\}/g, '_______________');
  
  return result;
}

// Convert template items to editor items format
export function templateItemsToEditorItems(templateItems: unknown[]): ProposalItem[] {
  if (!Array.isArray(templateItems)) return [];
  
  return templateItems.map((item: any, index) => ({
    name: item.name || item.description || "",
    description: item.description || "",
    details: item.details || "",
    quantity: item.quantity || 1,
    unit_price: item.unit_price || 0,
    show_price: item.show_price !== false, // Default to true
  }));
}
