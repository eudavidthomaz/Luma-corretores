import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PaymentType = "pix" | "bank_transfer" | "payment_link" | "custom";
export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

export interface PaymentConfig {
  id: string;
  profile_id: string;
  name: string;
  is_default: boolean;
  payment_type: PaymentType;
  // PIX
  pix_key: string | null;
  pix_key_type: PixKeyType | null;
  pix_holder_name: string | null;
  // Bank transfer
  bank_name: string | null;
  bank_agency: string | null;
  bank_account: string | null;
  account_holder: string | null;
  account_document: string | null;
  // Payment link
  payment_link_url: string | null;
  // Additional
  additional_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentConfigInsert {
  profile_id: string;
  name: string;
  is_default?: boolean;
  payment_type: PaymentType;
  pix_key?: string | null;
  pix_key_type?: PixKeyType | null;
  pix_holder_name?: string | null;
  bank_name?: string | null;
  bank_agency?: string | null;
  bank_account?: string | null;
  account_holder?: string | null;
  account_document?: string | null;
  payment_link_url?: string | null;
  additional_instructions?: string | null;
}

export interface PaymentConfigUpdate extends Partial<PaymentConfigInsert> {
  id: string;
}

export function usePaymentConfigs(profileId?: string) {
  return useQuery({
    queryKey: ["payment-configs", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from("payment_configs")
        .select("*")
        .eq("profile_id", profileId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PaymentConfig[];
    },
    enabled: !!profileId,
  });
}

export function usePaymentConfig(configId?: string) {
  return useQuery({
    queryKey: ["payment-config", configId],
    queryFn: async () => {
      if (!configId) return null;
      
      const { data, error } = await supabase
        .from("payment_configs")
        .select("*")
        .eq("id", configId)
        .single();
      
      if (error) throw error;
      return data as PaymentConfig;
    },
    enabled: !!configId,
  });
}

export function useDefaultPaymentConfig(profileId?: string) {
  return useQuery({
    queryKey: ["payment-config-default", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from("payment_configs")
        .select("*")
        .eq("profile_id", profileId)
        .eq("is_default", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as PaymentConfig | null;
    },
    enabled: !!profileId,
  });
}

export function useCreatePaymentConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: PaymentConfigInsert) => {
      // If this is set as default, unset other defaults first
      if (config.is_default) {
        await supabase
          .from("payment_configs")
          .update({ is_default: false })
          .eq("profile_id", config.profile_id);
      }
      
      const { data, error } = await supabase
        .from("payment_configs")
        .insert(config)
        .select()
        .single();
      
      if (error) throw error;
      return data as PaymentConfig;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payment-configs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-config-default", data.profile_id] });
    },
  });
}

export function useUpdatePaymentConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: PaymentConfigUpdate) => {
      // If setting as default, unset other defaults first
      if (updates.is_default && updates.profile_id) {
        await supabase
          .from("payment_configs")
          .update({ is_default: false })
          .eq("profile_id", updates.profile_id)
          .neq("id", id);
      }
      
      const { data, error } = await supabase
        .from("payment_configs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as PaymentConfig;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payment-configs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-config", data.id] });
      queryClient.invalidateQueries({ queryKey: ["payment-config-default", data.profile_id] });
    },
  });
}

export function useDeletePaymentConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from("payment_configs")
        .delete()
        .eq("id", configId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-configs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-config-default"] });
    },
  });
}

export function useSetDefaultPaymentConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ configId, profileId }: { configId: string; profileId: string }) => {
      // Unset all defaults
      await supabase
        .from("payment_configs")
        .update({ is_default: false })
        .eq("profile_id", profileId);
      
      // Set new default
      const { data, error } = await supabase
        .from("payment_configs")
        .update({ is_default: true })
        .eq("id", configId)
        .select()
        .single();
      
      if (error) throw error;
      return data as PaymentConfig;
    },
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ["payment-configs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-config-default", profileId] });
    },
  });
}

// Helper to format payment config for display
export function formatPaymentConfigForDisplay(config: PaymentConfig): string {
  switch (config.payment_type) {
    case "pix":
      return `PIX: ${config.pix_key || ""}${config.pix_holder_name ? ` (${config.pix_holder_name})` : ""}`;
    case "bank_transfer":
      return `${config.bank_name || "Banco"} - Ag: ${config.bank_agency || ""} / Cc: ${config.bank_account || ""}`;
    case "payment_link":
      return `Link de Pagamento`;
    case "custom":
      return config.additional_instructions?.substring(0, 50) || "Instruções personalizadas";
    default:
      return config.name;
  }
}

// Get payment type label
export function getPaymentTypeLabel(type: PaymentType): string {
  switch (type) {
    case "pix":
      return "PIX";
    case "bank_transfer":
      return "Transferência Bancária";
    case "payment_link":
      return "Link de Pagamento";
    case "custom":
      return "Instruções Personalizadas";
    default:
      return type;
  }
}

// Get PIX key type label
export function getPixKeyTypeLabel(type: PixKeyType): string {
  switch (type) {
    case "cpf":
      return "CPF";
    case "cnpj":
      return "CNPJ";
    case "email":
      return "E-mail";
    case "phone":
      return "Telefone";
    case "random":
      return "Chave Aleatória";
    default:
      return type;
  }
}
